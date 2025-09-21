import Customer from "../models/UserModels/customer.model.js";
import User from "../models/UserModels/user.model.js";
import Joi from "joi";

export const getAllCustomers = async (req, res) => {

    const customers = await Customer.findAll()
    return res.status(200).json({
        statusCode : 404,
        customers,
        message : "Getted"
    })
}   
export const getCustomersById = async (req, res) => {

    const {id} = req.params;

    const customer = await Customer.findByPk(id)
    if(!customer)
        return res.status(404).json({
            statusCode : 404,
            message : `Customer With Customer Id : ${id} Not Found`
        })
    return res.status(200).json({
        statusCode : 200,
        customer,
        message : "Getted"
    })
}   

const getAge = (dob) => {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export const updateCustomerById = async (req, res) => {
  const { id } = req.params;
  const {
    date_of_birth,
    address,
    driving_license_number,
    license_expiry_date,
    emergency_contact_name,
    emergency_contact_phone,
  } = req.body;

  // Define schema for optional fields (partial update)
  const customerUpdateSchema = Joi.object({
    date_of_birth: Joi.date()
      .optional()
      .custom((value, helpers) => {
        const age = getAge(value);
        if (age < 18 || age > 80) {
          return helpers.error("any.invalid");
        }
        return value;
      }, "Age validation")
      .messages({
        "any.invalid": "Age must be between 18 and 80 years",
      }),

    address: Joi.string()
      .max(300)
      .optional()
      .messages({
        "string.max": "Address must not exceed 300 characters",
      }),

    driving_license_number: Joi.string()
      .min(5)
      .max(50)
      .optional()
      .messages({
        "string.min": "Driving license number must be at least 5 characters",
        "string.max": "Driving license number must not exceed 50 characters",
      }),

    license_expiry_date: Joi.date()
      .greater("now")
      .optional()
      .messages({
        "date.greater": "License expiry date must be in the future",
      }),

    emergency_contact_name: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        "string.min": "Emergency contact name must be at least 2 characters",
        "string.max": "Emergency contact name must not exceed 100 characters",
      }),

    emergency_contact_phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        "string.pattern.base": "Emergency contact phone must be a valid 10-digit number",
      }),
  });

  // Validate
  const { error } = customerUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details.map((err) => err.message),
    });
  }

  // Prepare update fields (only non-empty)
  const updatedCustomer = {};
  if (date_of_birth) updatedCustomer.date_of_birth = date_of_birth;
  if (address) updatedCustomer.address = address;
  if (driving_license_number) updatedCustomer.driving_license_number = driving_license_number;
  if (license_expiry_date) updatedCustomer.license_expiry_date = license_expiry_date;
  if (emergency_contact_name) updatedCustomer.emergency_contact_name = emergency_contact_name;
  if (emergency_contact_phone) updatedCustomer.emergency_contact_phone = emergency_contact_phone;

  if (Object.keys(updatedCustomer).length === 0) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  // Update with WHERE condition
  const [rowsUpdated] = await Customer.update(updatedCustomer, { where: { id } });

  if (rowsUpdated === 0) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // Fetch updated record
  const updatedCustomerResponse = await Customer.findByPk(id);

  res.status(200).json({
    message: "Customer updated successfully",
    customer: updatedCustomerResponse,
  });
};

export const deleteCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        statusCode: 400,
        message: "Customer ID is required",
      });
    }

    // Find customer
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        statusCode: 404,
        message: `Customer not found with ID ${id}`,
      });
    }

    try {
      // Delete customer first
      await Customer.destroy({ where: { id } });

      // Delete linked user
      await User.destroy({ where: { id: customer.user_id } });

      return res.status(200).json({
        statusCode: 200,
        message: `Customer with ID ${id} deleted successfully`,
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong while deleting customer",
        error: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};