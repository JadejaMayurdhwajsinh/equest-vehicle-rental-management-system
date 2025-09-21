import Agent from "../models/UserModels/agent.model.js";
import User from "../models/UserModels/user.model.js";
import Joi from "joi";

export const getAllAgent = async (req, res) => {
  try {
    const agents = await Agent.findAll();
    return res.status(200).json({
        statusCode : 200,
        agents,
        message : "Agents"
    }) 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAgentById = async (req, res) => {
  try {

    const {id} = req.params;

    if(!id)
        return res.status(404).json({
            statusCode : 404,
            message : `Id ${id} Not Found !`
        }) 

    const agent = await Agent.findByPk(id);

    if(!agent)
        return res.status(404).json({
            statusCode : 404,
            message : `Agents Not Found With Id ${id}`
        }) 
    
    return res.status(200).json({
        statusCode : 200,
        agent,
        message : "Agents"
    }) 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAgentById = async (req, res) => {
  const { id } = req.params;
  const {
    employee_id,
    branch_location,
    role,
    hire_date,
    commission_rate,
    full_name
  } = req.body;

  // Define schema for optional fields
  const agentUpdateSchema = Joi.object({
    employee_id: Joi.string()
      .pattern(/^[A-Z]{2,3}[0-9]{4,6}$/)
      .optional()
      .messages({
        "string.pattern.base":
          "Employee ID must be 2-3 letters followed by 4-6 numbers (e.g., AG001, EMP12345)",
      }),

    branch_location: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        "string.min": "Branch location must be at least 2 characters",
        "string.max": "Branch location must not exceed 100 characters",
      }),

    role: Joi.string()
      .valid("manager", "supervisor", "agent", "senior_agent")
      .optional()
      .messages({
        "any.only": "Role must be manager, supervisor, agent, or senior_agent",
      }),

    hire_date: Joi.date()
      .max("now")
      .optional()
      .messages({
        "date.max": "Hire date cannot be in the future",
      }),

    commission_rate: Joi.number()
      .min(0)
      .max(50)
      .optional()
      .messages({
        "number.min": "Commission rate must be at least 0%",
        "number.max": "Commission rate cannot exceed 50%",
      }),

    full_name: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        "string.min": "Full name must be at least 2 characters",
        "string.max": "Full name must not exceed 100 characters",
      }),
  });

  // Validate
  const { error } = agentUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details.map((err) => err.message),
    });
  }

  // Check for duplicate employee_id (if updating employee_id)
  if (employee_id) {
    const existingAgent = await Agent.findOne({
      where: {
        employee_id,
        id: { [Op.ne]: id }, // exclude current agent
      },
    });
    if (existingAgent) {
      return res.status(400).json({
        message: "Employee ID already exists",
      });
    }
  }

  // Prepare update object
  const updatedAgent = {};
  if (employee_id) updatedAgent.employee_id = employee_id;
  if (branch_location) updatedAgent.branch_location = branch_location;
  if (role) updatedAgent.role = role;
  if (hire_date) updatedAgent.hire_date = hire_date;
  if (commission_rate !== undefined) updatedAgent.commission_rate = commission_rate;
  if (full_name) updatedAgent.full_name = full_name;

  if (Object.keys(updatedAgent).length === 0) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  // Update with WHERE condition
  const [rowsUpdated] = await Agent.update(updatedAgent, { where: { id } });

  if (rowsUpdated === 0) {
    return res.status(404).json({ message: "Agent not found" });
  }

  // Fetch updated record
  const updatedAgentResponse = await Agent.findByPk(id);

  res.status(200).json({
    message: "Agent updated successfully",
    agent: updatedAgentResponse,
  });
};

export const deleteAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        statusCode: 400,
        message: "Agent ID is required",
      });
    }

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({
        statusCode: 404,
        message: `Agent not found with ID ${id}`,
      });
    }

    try {
      await Agent.destroy({ where: { id } });
      await User.destroy({ where: { id: agent.user_id } });

      return res.status(200).json({
        statusCode: 200,
        message: `Agent with ID ${id} deleted successfully`,
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong while deleting agent",
        error: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const yourFuntion = async (req, res) => {
  try {
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

