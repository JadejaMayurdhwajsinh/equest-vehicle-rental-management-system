// backend/controllers/authController.js
import bcrypt from "bcrypt";
import validator from "validator";
import Joi from "joi";
import jwt from "jsonwebtoken";
import User from "../models/UserModels/user.model.js";
import Customer from "../models/UserModels/customer.model.js";
import Agent from "../models/UserModels/agent.model.js";
// Helper: Generate TokenC

const weakPasswords = ["password", "password123", "12345678", "admin", "qwerty"];

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const getAge = (dob) => {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const blockedDomains = ["mailinator.com", "tempmail.com", "10minutemail.com"];

function isDisposableEmail(email){
  const domain = email.split("@")[1];
  return blockedDomains.includes(domain);
}

// Register
export const register = async (req, res) => {
  try {
    const { user_type, email, password , full_name, phone, ...customer} = req.body;
    if (!["customer", "agent", "admin"].includes(user_type)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const schema = Joi.object({
      user_type: Joi.string()
        .valid("customer", "agent", "admin")
        .required()
        .messages({
          "any.only": "User type must be customer, agent, or admin",
          "any.required": "User type is required",
        }),

      email: Joi.string()
        .email()
        .required()
        .messages({
          "string.email": "Please enter a valid email address",
          "any.required": "Email is required",
        }),

      password: Joi.string()
        .min(8)
        .max(50)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$"))
        .required()
        .messages({
          "string.pattern.base":
            "Password must include uppercase, lowercase, number, and special character",
          "string.min": "Password must be at least 8 characters",
          "any.required": "Password is required",
        }),

      full_name: Joi.string()
        .pattern(/^[A-Za-z\s]{2,100}$/)
        .required()
        .messages({
          "string.pattern.base": "Name must be 2-100 characters, letters only",
          "any.required": "Full name is required",
        }),

      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
          "string.pattern.base": "Please enter a valid 10-digit phone number",
          "any.required": "Phone number is required",
        }),
    });
    
    const { error } = schema.validate(
      { user_type, email, password, full_name, phone },
      { abortEarly: false }
    );
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
      });
    }

    if (isDisposableEmail(email)) {
      return res.status(400).json({ message: "Disposable email addresses are not allowed" });
    }

    if (weakPasswords.includes(password.toLowerCase())) {
      return res.status(400).json({ message: "This password is too common. Choose another one" });
    }


    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) 
      return res.status(400).json({ message: "User already exists" });

    let newUser;

    

    if (user_type === "customer") {
      // DOB
      if (!customer.date_of_birth || getAge(customer.date_of_birth) < 18 || getAge(customer.date_of_birth) > 80) {
        return res.status(400).json({ message: "Must be 18-80 years old to rent vehicles" });
      }

      // Address
      if (!customer.address || customer.address.length > 300) {
        return res.status(400).json({ message: "Address is required (max 300 characters)" });
      }

      // Driving license
      if (!customer.driving_license_number || !customer.license_expiry_date) {
        return res.status(400).json({ message: "Valid driving license required" });
      }

      // Emergency contact
      if (!customer.emergency_contact_name || !customer.emergency_contact_phone) {
        return res
          .status(400)
          .json({ message: "Emergency contact details required" });
      }
    
      try {
        newUser = await User.create({ user_type, email, password_hash:password ,full_name,phone});
        const newCustomer = await Customer.create({
          user_id: newUser.id,
          date_of_birth:customer.date_of_birth,
          address:customer.address,
          driving_license_number:customer.driving_license_number,
          license_expiry_date:customer.license_expiry_date,
          emergency_contact_name:customer.emergency_contact_name,
          emergency_contact_phone:customer.emergency_contact_phone,
        });
        ////console.log(newCustomer);
      } catch (error) {
        await User.destroy({where:{id:newUser.id}})
        return res.status(500).json({
          message : "Something Went Wrong While Registering In Customer",
          error : error.message
        })

      }
    }
     if(user_type === "agent"){
      // Agent-specific validations
      
      
      const agentSchema = Joi.object({
        employee_id: Joi.string()
          .pattern(/^[A-Z]{2,3}[0-9]{4,6}$/)
          .required()
          .messages({
            "string.pattern.base": "Employee ID must be 2-3 letters followed by 4-6 numbers (e.g., AG001, EMP12345)",
            "any.required": "Employee ID is required"
          }),
        
        branch_location: Joi.string()
          .min(2)
          .max(100)
          .required()
          .messages({
            "string.min": "Branch location must be at least 2 characters",
            "string.max": "Branch location must not exceed 100 characters",
            "any.required": "Branch location is required"
          }),

        role: Joi.string()
          .valid("manager", "supervisor", "agent", "senior_agent")
          .required()
          .messages({
            "any.only": "Role must be manager, supervisor, agent, or senior_agent",
            "any.required": "Role is required"
          }),
        
        hire_date: Joi.date()
          .max('now')
          .required()
          .messages({
            "date.max": "Hire date cannot be in the future",
            "any.required": "Hire date is required"
          }),
        
        commission_rate: Joi.number()
          .min(0)
          .max(50)
          .default(5.00)
          .messages({
            "number.min": "Commission rate must be at least 0%",
            "number.max": "Commission rate cannot exceed 50%"
          })
      });
      //console.log("agent ldm2");
      
      const {employee_id,role,hire_date,branch_location,commission_rate} = customer

      //console.log(employee_id);
      //console.log("ROLE"+role);
      //console.log(hire_date);
      //console.log(branch_location);
      //console.log(commission_rate);
      

      const { error: agentError } = agentSchema.validate({employee_id,role,hire_date,branch_location,commission_rate}, { abortEarly: false });
      
      if (agentError) {
        
        return res.status(400).json({
          message: "Validation Error",
          details: agentError.details.map((err) => err.message)
        });
      }

      // Check if employee_id already exists
     
      
      const existingAgent = await Agent.findOne({ where: { employee_id: customer.employee_id } });
      if (existingAgent) {
        await User.destroy({ where: { id: newUser.id } });
        return res.status(400).json({ 
          message: "Employee ID already exists" 
        });
      }
      //console.log("LDM-3");
      
      // Validate hire date is not in the future
      const hireDate = new Date(customer.hire_date);
      const today = new Date();
      if (hireDate > today) {
        await User.destroy({ where: { id: newUser.id } });
        return res.status(400).json({ 
          message: "Hire date cannot be in the future" 
        });
      }

      // Validate commission rate
      if (customer.commission_rate && (customer.commission_rate < 0 || customer.commission_rate > 50)) {
        await User.destroy({ where: { id: newUser.id } });
        return res.status(400).json({ 
          message: "Commission rate must be between 0% and 50%" 
        });
      }

      newUser = await User.create({ user_type, email, password_hash:password ,full_name,phone});
      try {
        const newAgent = await Agent.create({
          user_id: newUser.id,
          employee_id: customer.employee_id,
          branch_location: customer.branch_location,
          full_name,
          role: customer.role,
          hire_date: customer.hire_date,
          commission_rate: customer.commission_rate || 5.00
        });
        
        //////console.log("Agent created successfully:", newAgent);
      } catch (error) {
        await User.destroy({ where: { id: newUser.id } });
        return res.status(500).json({
          message: "Something went wrong while registering agent",
          error: error.message
        });
      }
    }

    if(!newUser)
      newUser = await User.create({ user_type, email, password_hash:password ,full_name,phone});
      
    //console.log("Here");

    res.status(201).json({
      message: "User registered successfully",

      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email,
        full_name : newUser.full_name, 
        phone:newUser.phone 
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //console.log(req.body);

    ////console.log(email);
    ////console.log(password);

    const user = await User.findOne({ where: { email } });
    //console.log(user);
    
    if (!user || !validator.isEmail(email)) return res.status(400).json({ message: "Invalid email or password XX" });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    //console.log("Here",isMatch);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // let token = "TOKEN"
    const token = generateToken(user);
    //console.log("token",token);
    

    res.json({
      message: "Login successful",
      token,
      user_type:user.user_type
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Profile (Protected)
export const getProfile = async (req, res) => {
  try {
    let data;
    if(req.user.user_type === 'customer')
      data = await Customer.findOne({where:{user_id:req.user.id}});
    else 
      res.json(req.user)

    if (!data) return res.status(404).json({ message: "User not found" });
    res.json({id:data.id,user_type:req.user.user_type});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getProfileInfo = async (req, res) => {
  try {
    let data;
    if(req.user.user_type === 'customer')
      data = await Customer.findOne({where:{user_id:req.user.id}});
    else 
      data = await User.findByPk(req.user.id)

    if (!data) return res.status(404).json({ message: "User not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/*




*/