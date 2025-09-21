import Maintenance from "../models/maintenanceModels/maintenanceRecord.model.js";
import Vehicle from "../models/vehicleModels/vehicle.model.js";
import Agent from "../models/UserModels/agent.model.js";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

// ➕ Create a new maintenance record (Agent only)
export const createMaintenanceRecord = async (req, res) => {
  try {
    const {
      vehicle_id,
      maintenance_type,
      description,
      service_date,
      mileage_at_service,
      cost,
      service_provider,
      next_service_due_mileage,
      next_service_due_date,
    } = req.body;

    // Enhanced validation
    if (!vehicle_id || !maintenance_type || !service_date) {
      return res.status(400).json({
        success: false,
        message: "vehicle_id, maintenance_type, and service_date are required"
      });
    }

    // Validate maintenance_type enum
    const validTypes = ['service', 'repair', 'inspection', 'cleaning'];
    if (!validTypes.includes(maintenance_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance_type. Must be one of: service, repair, inspection, cleaning"
      });
    }

    // Validate dates
    const serviceDate = new Date(service_date);
    if (isNaN(serviceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid service_date format"
      });
    }

    if (next_service_due_date) {
      const nextServiceDate = new Date(next_service_due_date);
      if (isNaN(nextServiceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid next_service_due_date format"
        });
      }
    }

    // Validate cost
    if (cost && (isNaN(cost) || cost < 0)) {
      return res.status(400).json({
        success: false,
        message: "Cost must be a positive number"
      });
    }

    // Validate mileage
    if (mileage_at_service && (isNaN(mileage_at_service) || mileage_at_service < 0)) {
      return res.status(400).json({
        success: false,
        message: "Mileage must be a positive number"
      });
    }

    // Validate vehicle exists
    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    console.log(req.user.id);
    // Get agent information
    const agent = await Agent.findOne({ where: { user_id: req.user.id } });
    console.log(agent);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }

    // Create maintenance record
    const record = await Maintenance.create({
      vehicle_id,
      maintenance_type,
      description,
      service_date,
      mileage_at_service: mileage_at_service || vehicle.current_mileage || 0,
      cost: cost || 0,
      service_provider: service_provider || "Not specified",
      next_service_due_mileage,
      next_service_due_date,
      performed_by: agent.id, // Use agent.id instead of user.id
    });

    // Update vehicle status and mileage
    if (maintenance_type === 'repair' || maintenance_type === 'service') {
      vehicle.status = 'maintenance';
    }
    if (mileage_at_service) {
      vehicle.last_service_mileage = mileage_at_service;
    }
    await vehicle.save();

    // Fetch the created record with associations
    const createdRecord = await Maintenance.findByPk(record.id, {
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'vehicle_number', 'make', 'model', 'status'] },
        { model: Agent, as: "agent", attributes: ['id', 'employee_id', 'full_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Maintenance record created successfully",
      data: createdRecord
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 🔍 Get maintenance records by vehicle
export const getMaintenanceRecordsByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { page = 1, limit = 10, maintenance_type, start_date, end_date } = req.query;

    // Validate vehicleId
    if (!vehicleId || isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Valid vehicle ID is required"
      });
    }

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    // Build where clause
    const whereClause = { vehicle_id: vehicleId };

    if (maintenance_type) {
      whereClause.maintenance_type = maintenance_type;
    }

    if (start_date && end_date) {
      whereClause.service_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const limitNum = parseInt(limit);

    const { count, rows: records } = await Maintenance.findAndCountAll({
      where: whereClause,
      order: [['service_date', 'DESC']],
      include: [
        {
          model: Agent,
          attributes: ['id', 'employee_id', 'full_name'],
          as: 'agent'
        }
      ],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        vehicle: {
          id: vehicle.id,
          vehicle_number: vehicle.vehicle_number,
          make: vehicle.make,
          model: vehicle.model,
          status: vehicle.status
        },
        records,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance records by vehicle:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 🔍 Get maintenance records created by current agent
export const getMaintenanceByAgent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, maintenance_type, start_date, end_date } = req.query;

    const agent = await Agent.findOne({ where: { user_id: userId } });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }

    // Build where clause
    const whereClause = { performed_by: agent.id };

    if (maintenance_type) {
      whereClause.maintenance_type = maintenance_type;
    }

    if (start_date && end_date) {
      whereClause.service_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const limitNum = parseInt(limit);

    const { count, rows: records } = await Maintenance.findAndCountAll({
      where: whereClause,
      order: [['service_date', 'DESC']],
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model', 'status'],
          as: 'vehicle'
        }
      ],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        agent: {
          id: agent.id,
          employee_id: agent.employee_id,
          full_name: agent.full_name
        },
        records,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance records by agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 🔍 Get all maintenance records with filtering and pagination
export const getAllMaintenanceRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      maintenance_type,
      start_date,
      end_date,
      vehicle_id,
      performed_by,
      sort_by = 'service_date',
      sort_order = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = {};

    if (maintenance_type) {
      whereClause.maintenance_type = maintenance_type;
    }

    if (start_date && end_date) {
      whereClause.service_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    if (vehicle_id) {
      whereClause.vehicle_id = vehicle_id;
    }

    if (performed_by) {
      whereClause.performed_by = performed_by;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const limitNum = parseInt(limit);

    const { count, rows: records } = await Maintenance.findAndCountAll({
      where: whereClause,
      order: [[sort_by, sort_order.toUpperCase()]],
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model', 'status'],
          as: 'vehicle'
        },
        {
          model: Agent,
          attributes: ['id', 'employee_id', 'full_name'],
          as: 'agent'
        }
      ],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all maintenance records:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 🔍 Get maintenance record by ID
export const getMaintenanceRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid maintenance record ID is required"
      });
    }

    const record = await Maintenance.findByPk(id, {
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model', 'year', 'status', 'current_mileage'],
          as: 'vehicle'
        },
        {
          model: Agent,
          attributes: ['id', 'employee_id', 'full_name'],
          as: 'agent'
        }
      ]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching maintenance record by ID:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✏️ Update maintenance record (Agent only)
export const updateMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      maintenance_type,
      description,
      service_date,
      mileage_at_service,
      cost,
      service_provider,
      next_service_due_mileage,
      next_service_due_date,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid maintenance record ID is required"
      });
    }

    // Validate maintenance_type if provided
    if (maintenance_type) {
      const validTypes = ['service', 'repair', 'inspection', 'cleaning'];
      if (!validTypes.includes(maintenance_type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid maintenance_type. Must be one of: service, repair, inspection, cleaning"
        });
      }
    }

    // Validate dates if provided
    if (service_date) {
      const serviceDate = new Date(service_date);
      if (isNaN(serviceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid service_date format"
        });
      }
    }

    if (next_service_due_date) {
      const nextServiceDate = new Date(next_service_due_date);
      if (isNaN(nextServiceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid next_service_due_date format"
        });
      }
    }

    // Validate cost if provided
    if (cost && (isNaN(cost) || cost < 0)) {
      return res.status(400).json({
        success: false,
        message: "Cost must be a positive number"
      });
    }

    // Validate mileage if provided
    if (mileage_at_service && (isNaN(mileage_at_service) || mileage_at_service < 0)) {
      return res.status(400).json({
        success: false,
        message: "Mileage must be a positive number"
      });
    }

    // Find the record
    const record = await Maintenance.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }

    // Check if the current user is the agent who created the record
    const agent = await Agent.findOne({ where: { user_id: req.user.id } });
    if (!agent || record.performed_by !== agent.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update maintenance records you created"
      });
    }

    // Update the record
    const updateData = {};
    if (maintenance_type) updateData.maintenance_type = maintenance_type;
    if (description !== undefined) updateData.description = description;
    if (service_date) updateData.service_date = service_date;
    if (mileage_at_service !== undefined) updateData.mileage_at_service = mileage_at_service;
    if (cost !== undefined) updateData.cost = cost;
    if (service_provider !== undefined) updateData.service_provider = service_provider;
    if (next_service_due_mileage !== undefined) updateData.next_service_due_mileage = next_service_due_mileage;
    if (next_service_due_date !== undefined) updateData.next_service_due_date = next_service_due_date;

    await record.update(updateData);

    // Fetch updated record with associations
    const updatedRecord = await Maintenance.findByPk(id, {
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model', 'status'],
          as: 'vehicle'
        },
        {
          model: Agent,
          attributes: ['id', 'employee_id', 'full_name'],
          as: 'agent'
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully",
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 🗑️ Delete maintenance record (Agent only)
export const deleteMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid maintenance record ID is required"
      });
    }

    // Find the record
    const record = await Maintenance.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }

    // Check if the current user is the agent who created the record
    const agent = await Agent.findOne({ where: { user_id: req.user.id } });
    if (!agent || record.performed_by !== agent.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete maintenance records you created"
      });
    }

    await record.destroy();

    res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 📊 Get maintenance analytics and statistics
export const getMaintenanceAnalytics = async (req, res) => {
  try {
    const { start_date, end_date, vehicle_id } = req.query;
    console.log(start_date);
    console.log(end_date);
    console.log(vehicle_id);


    // Build where clause for date range
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.service_date = {
        [Op.between]: [start_date, end_date]
      };
    }
    if (vehicle_id) {
      whereClause.vehicle_id = vehicle_id;
    }

    // Get total maintenance records
    const totalRecords = await Maintenance.count({ where: whereClause });

    // Get maintenance by type
    const maintenanceByType = await Maintenance.findAll({
      where: whereClause,
      attributes: [
        'maintenance_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('cost')), 'total_cost']
      ],
      group: ['maintenance_type'],
      raw: true
    });

    // Get total cost
    const totalCost = await Maintenance.sum('cost', { where: whereClause });

    // Get average cost per maintenance
    const avgCost = totalRecords > 0 ? totalCost / totalRecords : 0;

    // Get maintenance by month (last 12 months)
    const monthlyMaintenance = await Maintenance.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('service_date'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('cost')), 'total_cost']
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('service_date'), '%Y-%m')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('service_date'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // Get vehicles with most maintenance
    const vehiclesWithMostMaintenance = await Maintenance.findAll({
      where: whereClause,
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model'],
          as: 'vehicle'
        }
      ],
      attributes: [
        'vehicle_id',
        [Sequelize.fn('COUNT', Sequelize.col('MaintenanceRecord.id')), 'maintenance_count'],
        [Sequelize.fn('SUM', Sequelize.col('MaintenanceRecord.cost')), 'total_cost']
      ],
      group: ['vehicle_id', 'vehicle.id', 'vehicle.vehicle_number', 'vehicle.make', 'vehicle.model'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('MaintenanceRecord.id')), 'DESC']],
      limit: 10
    });

    // Get upcoming maintenance (next 30 days)
    const upcomingMaintenance = await Maintenance.findAll({
      where: {
        next_service_due_date: {
          [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        }
      },
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model', 'status'],
          as: 'vehicle'
        }
      ],
      order: [['next_service_due_date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRecords,
          totalCost: totalCost || 0,
          averageCost: Math.round(avgCost * 100) / 100
        },
        maintenanceByType,
        monthlyMaintenance,
        vehiclesWithMostMaintenance,
        upcomingMaintenance: upcomingMaintenance.slice(0, 10) // Limit to 10
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 🔍 Get upcoming maintenance for vehicles
export const getUpcomingMaintenance = async (req, res) => {
  try {
    const { days = 30, vehicle_id } = req.query;
    const daysNum = parseInt(days);

    if (isNaN(daysNum) || daysNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Days must be a positive number"
      });
    }

    const whereClause = {
      next_service_due_date: {
        [Op.between]: [new Date(), new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000)]
      }
    };

    if (vehicle_id) {
      whereClause.vehicle_id = vehicle_id;
    }

    const upcomingMaintenance = await Maintenance.findAll({
      where: whereClause,
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model', 'status', 'current_mileage'],
          as: 'vehicle'
        },
        {
          model: Agent,
          attributes: ['id', 'employee_id', 'full_name'],
          as: 'agent'
        }
      ],
      order: [['next_service_due_date', 'ASC']]
    });

    // Group by urgency
    const today = new Date();
    const urgent = [];
    const upcoming = [];

    upcomingMaintenance.forEach(record => {
      const dueDate = new Date(record.next_service_due_date);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= 7) {
        urgent.push({ ...record.toJSON(), daysUntilDue });
      } else {
        upcoming.push({ ...record.toJSON(), daysUntilDue });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        urgent,
        upcoming,
        total: upcomingMaintenance.length
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 🔍 Get maintenance statistics for dashboard
export const getMaintenanceStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get records in the period
    const records = await Maintenance.findAll({
      where: {
        service_date: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: Vehicle,
          attributes: ['id', 'vehicle_number', 'make', 'model', 'status'],
          as: 'vehicle'
        }
      ]
    });

    // Calculate statistics
    const totalCost = records.reduce((sum, record) => sum + (parseFloat(record.cost) || 0), 0);
    const avgCost = records.length > 0 ? totalCost / records.length : 0;

    // Group by maintenance type
    const byType = records.reduce((acc, record) => {
      const type = record.maintenance_type;
      if (!acc[type]) {
        acc[type] = { count: 0, cost: 0 };
      }
      acc[type].count++;
      acc[type].cost += parseFloat(record.cost) || 0;
      return acc;
    }, {});

    // Get vehicles in maintenance
    const vehiclesInMaintenance = await Vehicle.count({
      where: { status: 'maintenance' }
    });

    // Get total vehicles
    const totalVehicles = await Vehicle.count();

    res.status(200).json({
      success: true,
      data: {
        period: `${periodDays} days`,
        totalRecords: records.length,
        totalCost: Math.round(totalCost * 100) / 100,
        averageCost: Math.round(avgCost * 100) / 100,
        maintenanceByType: byType,
        vehiclesInMaintenance,
        totalVehicles,
        maintenancePercentage: totalVehicles > 0 ? Math.round((vehiclesInMaintenance / totalVehicles) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
