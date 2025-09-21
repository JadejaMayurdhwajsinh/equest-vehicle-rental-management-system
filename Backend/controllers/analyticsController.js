// backend/controllers/analytics.controller.js
import Booking from "../models/bookingModels/booking.model.js";
import Vehicle from "../models/vehicleModels/vehicle.model.js";
import Maintenance from "../models/maintenanceModels/maintenanceRecord.model.js";
import Customer from "../models/UserModels/customer.model.js";
import Agent from "../models/UserModels/agent.model.js";
import { Sequelize } from "sequelize";
const { Op, fn, col, literal } = Sequelize;

// 1️⃣ Overview: active rentals, available vehicles, today's revenue, maintenance due
export const getOverview = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    // Calculate date range based on period
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(now);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date(now);
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
    }

    // Get basic counts
    const activeRentals = await Booking.count({ where: { status: 'active' } });
    const availableVehicles = await Vehicle.count({ where: { status: 'available' } });
    const totalVehicles = await Vehicle.count();
    const maintenanceDue = await Vehicle.count({ where: { status: 'maintenance' } });
    const outOfService = await Vehicle.count({ where: { status: 'out_of_service' } });

    // Get revenue for the period
    const periodRevenue = await Booking.sum('total_amount', {
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
        status: { [Op.in]: ['active', 'completed'] }
      }
    });

    // Get total bookings for the period
    const periodBookings = await Booking.count({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    });

    // Get total customers
    const totalCustomers = await Customer.count();

    // Get upcoming maintenance (next 7 days)
    const upcomingMaintenance = await Maintenance.count({
      where: {
        next_service_due_date: {
          [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        }
      }
    });

    // Calculate utilization percentage
    const utilizationPercentage = totalVehicles > 0 ? 
      Math.round(((totalVehicles - availableVehicles - maintenanceDue - outOfService) / totalVehicles) * 100) : 0;

    res.status(200).json({ 
      success: true,
      data: {
        period,
        summary: {
          activeRentals,
          availableVehicles,
          totalVehicles,
          maintenanceDue,
          outOfService,
          totalCustomers,
          upcomingMaintenance,
          utilizationPercentage
        },
        revenue: {
          periodRevenue: periodRevenue || 0,
          periodBookings
        }
      }
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// 2️⃣ Bookings analytics: daily booking count with filtering
export const getBookingsAnalytics = async (req, res) => {
  try {
    const { 
      days = 7, 
      start_date, 
      end_date, 
      status,
      group_by = 'day' 
    } = req.query;

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: "Days must be a number between 1 and 365"
      });
    }

    // Calculate date range
    let startDate, endDate;
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (daysNum - 1));
      startDate.setHours(0, 0, 0, 0);
    }

    // Build where clause
    const whereClause = {
      created_at: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    };

    if (status) {
      whereClause.status = status;
    }

    // Determine grouping function based on group_by parameter
    let groupFunction, orderColumn;
    switch (group_by) {
      case 'hour':
        groupFunction = fn('DATE_TRUNC', 'hour', col('created_at'));
        orderColumn = col('created_at');
        break;
      case 'day':
        groupFunction = fn('DATE', col('created_at'));
        orderColumn = col('date');
        break;
      case 'week':
        groupFunction = fn('DATE_TRUNC', 'week', col('created_at'));
        orderColumn = col('created_at');
        break;
      case 'month':
        groupFunction = fn('DATE_TRUNC', 'month', col('created_at'));
        orderColumn = col('created_at');
        break;
      default:
        groupFunction = fn('DATE', col('created_at'));
        orderColumn = col('date');
    }

    const bookings = await Booking.findAll({
      attributes: [
        [groupFunction, 'period'],
        [fn('COUNT', col('id')), 'totalBookings'],
        [fn('SUM', col('total_amount')), 'totalRevenue'],
        [fn('AVG', col('total_amount')), 'averageBookingValue']
      ],
      where: whereClause,
      group: [groupFunction],
      order: [[orderColumn, 'ASC']]
    });

    // Get additional statistics
    const totalBookings = await Booking.count({ where: whereClause });
    const totalRevenue = await Booking.sum('total_amount', { where: whereClause });
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    res.status(200).json({ 
      success: true,
      data: {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupBy: group_by
        },
        summary: {
          totalBookings,
          totalRevenue: totalRevenue || 0,
          averageBookingValue: Math.round(averageBookingValue * 100) / 100
        },
        analytics: bookings
      }
    });
  } catch (error) {
    console.error('Error fetching bookings analytics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// 3️⃣ Revenue analytics: comprehensive revenue analysis
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { 
      days = 30, 
      start_date, 
      end_date, 
      group_by = 'day',
      include_breakdown = true 
    } = req.query;

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: "Days must be a number between 1 and 365"
      });
    }

    // Calculate date range
    let startDate, endDate;
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (daysNum - 1));
      startDate.setHours(0, 0, 0, 0);
    }

    // Build where clause for completed and active bookings
    const whereClause = {
      created_at: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      },
      status: { [Op.in]: ['active', 'completed'] }
    };

    // Determine grouping function
    let groupFunction, orderColumn;
    switch (group_by) {
      case 'hour':
        groupFunction = fn('DATE_TRUNC', 'hour', col('created_at'));
        orderColumn = col('created_at');
        break;
      case 'day':
        groupFunction = fn('DATE', col('created_at'));
        orderColumn = col('date');
        break;
      case 'week':
        groupFunction = fn('DATE_TRUNC', 'week', col('created_at'));
        orderColumn = col('created_at');
        break;
      case 'month':
        groupFunction = fn('DATE_TRUNC', 'month', col('created_at'));
        orderColumn = col('created_at');
        break;
      default:
        groupFunction = fn('DATE', col('created_at'));
        orderColumn = col('date');
    }

    // Get revenue data
    const revenue = await Booking.findAll({
      attributes: [
        [groupFunction, 'period'],
        [fn('SUM', col('total_amount')), 'totalRevenue'],
        [fn('COUNT', col('id')), 'bookingCount'],
        [fn('AVG', col('total_amount')), 'averageRevenue']
      ],
      where: whereClause,
      group: [groupFunction],
      order: [[orderColumn, 'ASC']]
    });

    // Get total revenue and statistics
    const totalRevenue = await Booking.sum('total_amount', { where: whereClause });
    const totalBookings = await Booking.count({ where: whereClause });
    const averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get revenue breakdown by status if requested
    let breakdown = null;
    if (include_breakdown === 'true') {
      breakdown = await Booking.findAll({
        attributes: [
          'status',
          [fn('SUM', col('total_amount')), 'revenue'],
          [fn('COUNT', col('id')), 'count']
        ],
        where: {
          created_at: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        group: ['status']
      });
    }

    // Get top performing vehicles by revenue
    const topVehicles = await Booking.findAll({
      attributes: [
        'vehicle_id',
        [fn('SUM', col('total_amount')), 'revenue'],
        [fn('COUNT', col('id')), 'bookingCount']
      ],
      where: whereClause,
      include: [
        {
          model: Vehicle,
          attributes: ['vehicle_number', 'make', 'model'],
          as: 'vehicle'
        }
      ],
      group: ['vehicle_id', 'vehicle.id', 'vehicle.vehicle_number', 'vehicle.make', 'vehicle.model'],
      order: [[fn('SUM', col('total_amount')), 'DESC']],
      limit: 10
    });

    res.status(200).json({ 
      success: true,
      data: {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupBy: group_by
        },
        summary: {
          totalRevenue: totalRevenue || 0,
          totalBookings,
          averageRevenue: Math.round(averageRevenue * 100) / 100
        },
        analytics: revenue,
        breakdown,
        topVehicles
      }
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// 4️⃣ Vehicle utilization: comprehensive vehicle performance analysis
export const getVehicleUtilization = async (req, res) => {
  try {
    const { 
      days = 30, 
      start_date, 
      end_date,
      include_details = false,
      sort_by = 'utilization',
      order = 'DESC'
    } = req.query;

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: "Days must be a number between 1 and 365"
      });
    }

    // Calculate date range
    let startDate, endDate;
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (daysNum - 1));
      startDate.setHours(0, 0, 0, 0);
    }

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Get all vehicles with their details
    const vehicles = await Vehicle.findAll({
      attributes: ['id', 'vehicle_number', 'make', 'model', 'status', 'daily_rate', 'current_mileage'],
      include: [
        {
          model: Booking,
          as: 'bookings',
          attributes: ['id', 'total_days', 'total_amount', 'status', 'created_at'],
          where: {
            created_at: {
              [Op.gte]: startDate,
              [Op.lte]: endDate
            },
            status: { [Op.in]: ['active', 'completed'] }
          },
          required: false
        }
      ]
    });

    let result = [];
    let totalUtilization = 0;
    let totalRevenue = 0;

    for (let vehicle of vehicles) {
      const rentedDays = vehicle.bookings.reduce((sum, booking) => sum + (booking.total_days || 0), 0);
      const revenue = vehicle.bookings.reduce((sum, booking) => sum + (parseFloat(booking.total_amount) || 0), 0);
      const utilization = totalDays > 0 ? ((rentedDays / totalDays) * 100) : 0;
      
      totalUtilization += utilization;
      totalRevenue += revenue;

      const vehicleData = {
        vehicleId: vehicle.id,
        vehicleNumber: vehicle.vehicle_number,
        make: vehicle.make,
        model: vehicle.model,
        status: vehicle.status,
        dailyRate: vehicle.daily_rate,
        currentMileage: vehicle.current_mileage,
        rentedDays,
        revenue: Math.round(revenue * 100) / 100,
        utilizationPercentage: Math.round(utilization * 100) / 100,
        bookingCount: vehicle.bookings.length
      };

      if (include_details === 'true') {
        vehicleData.bookings = vehicle.bookings.map(booking => ({
          id: booking.id,
          totalDays: booking.total_days,
          totalAmount: booking.total_amount,
          status: booking.status,
          createdAt: booking.created_at
        }));
      }

      result.push(vehicleData);
    }

    // Sort results
    const sortField = sort_by === 'revenue' ? 'revenue' : 
                     sort_by === 'bookings' ? 'bookingCount' : 'utilizationPercentage';
    result.sort((a, b) => {
      if (order.toUpperCase() === 'ASC') {
        return a[sortField] - b[sortField];
      } else {
        return b[sortField] - a[sortField];
      }
    });

    // Calculate overall statistics
    const averageUtilization = result.length > 0 ? totalUtilization / result.length : 0;
    const totalVehicles = result.length;
    const activeVehicles = result.filter(v => v.status === 'available').length;
    const maintenanceVehicles = result.filter(v => v.status === 'maintenance').length;

    res.status(200).json({ 
      success: true,
      data: {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          totalDays
        },
        summary: {
          totalVehicles,
          activeVehicles,
          maintenanceVehicles,
          averageUtilization: Math.round(averageUtilization * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100
        },
        vehicles: result
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle utilization:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// 5️⃣ Customer analytics: customer behavior and performance
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { 
      days = 30, 
      start_date, 
      end_date,
      include_details = false 
    } = req.query;

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: "Days must be a number between 1 and 365"
      });
    }

    // Calculate date range
    let startDate, endDate;
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (daysNum - 1));
      startDate.setHours(0, 0, 0, 0);
    }

    // Get customer statistics
    const totalCustomers = await Customer.count();
    
    // Get customers with booking activity in the period
    const activeCustomers = await Customer.findAll({
      include: [
        {
          model: Booking,
          as: 'bookings',
          where: {
            created_at: {
              [Op.gte]: startDate,
              [Op.lte]: endDate
            }
          },
          required: true
        }
      ],
      attributes: [
        'id', 'full_name', 'email', 'phone', 'created_at',
        [fn('COUNT', col('bookings.id')), 'bookingCount'],
        [fn('SUM', col('bookings.total_amount')), 'totalSpent'],
        [fn('AVG', col('bookings.total_amount')), 'averageBookingValue']
      ],
      group: ['Customer.id', 'Customer.full_name', 'Customer.email', 'Customer.phone', 'Customer.created_at'],
      order: [[fn('SUM', col('bookings.total_amount')), 'DESC']]
    });

    // Get new customers in the period
    const newCustomers = await Customer.count({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    });

    // Get customer retention rate (customers who booked in both periods)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysNum);
    
    const previousPeriodCustomers = await Customer.findAll({
      include: [
        {
          model: Booking,
          as: 'bookings',
          where: {
            created_at: {
              [Op.gte]: previousPeriodStart,
              [Op.lt]: startDate
            }
          },
          required: true
        }
      ],
      attributes: ['id']
    });

    const currentPeriodCustomers = await Customer.findAll({
      include: [
        {
          model: Booking,
          as: 'bookings',
          where: {
            created_at: {
              [Op.gte]: startDate,
              [Op.lte]: endDate
            }
          },
          required: true
        }
      ],
      attributes: ['id']
    });

    const retainedCustomers = currentPeriodCustomers.filter(customer => 
      previousPeriodCustomers.some(prev => prev.id === customer.id)
    ).length;

    const retentionRate = previousPeriodCustomers.length > 0 ? 
      (retainedCustomers / previousPeriodCustomers.length) * 100 : 0;

    // Get top customers by revenue
    const topCustomers = activeCustomers.slice(0, 10).map(customer => ({
      id: customer.id,
      name: customer.full_name,
      email: customer.email,
      bookingCount: parseInt(customer.dataValues.bookingCount),
      totalSpent: parseFloat(customer.dataValues.totalSpent) || 0,
      averageBookingValue: parseFloat(customer.dataValues.averageBookingValue) || 0
    }));

    res.status(200).json({ 
      success: true,
      data: {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          days: daysNum
        },
        summary: {
          totalCustomers,
          activeCustomers: activeCustomers.length,
          newCustomers,
          retentionRate: Math.round(retentionRate * 100) / 100
        },
        topCustomers,
        detailedCustomers: include_details === 'true' ? activeCustomers : null
      }
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// 6️⃣ Maintenance analytics: maintenance costs and trends
export const getMaintenanceAnalytics = async (req, res) => {
  try {
    const { 
      days = 30, 
      start_date, 
      end_date,
      group_by = 'month' 
    } = req.query;

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: "Days must be a number between 1 and 365"
      });
    }

    // Calculate date range
    let startDate, endDate;
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (daysNum - 1));
      startDate.setHours(0, 0, 0, 0);
    }

    // Get maintenance records in the period
    const maintenanceRecords = await Maintenance.findAll({
      where: {
        service_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      include: [
        {
          model: Vehicle,
          attributes: ['vehicle_number', 'make', 'model'],
          as: 'vehicle'
        },
        {
          model: Agent,
          attributes: ['employee_id', 'full_name'],
          as: 'agent'
        }
      ]
    });

    // Calculate total maintenance cost
    const totalCost = maintenanceRecords.reduce((sum, record) => 
      sum + (parseFloat(record.cost) || 0), 0
    );

    // Group by maintenance type
    const maintenanceByType = maintenanceRecords.reduce((acc, record) => {
      const type = record.maintenance_type;
      if (!acc[type]) {
        acc[type] = { count: 0, cost: 0, records: [] };
      }
      acc[type].count++;
      acc[type].cost += parseFloat(record.cost) || 0;
      acc[type].records.push(record);
      return acc;
    }, {});

    // Get maintenance trends by time period
    let groupFunction;
    switch (group_by) {
      case 'day':
        groupFunction = fn('DATE', col('service_date'));
        break;
      case 'week':
        groupFunction = fn('DATE_TRUNC', 'week', col('service_date'));
        break;
      case 'month':
        groupFunction = fn('DATE_TRUNC', 'month', col('service_date'));
        break;
      default:
        groupFunction = fn('DATE_TRUNC', 'month', col('service_date'));
    }

    const maintenanceTrends = await Maintenance.findAll({
      attributes: [
        [groupFunction, 'period'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('cost')), 'totalCost'],
        [fn('AVG', col('cost')), 'averageCost']
      ],
      where: {
        service_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      group: [groupFunction],
      order: [[groupFunction, 'ASC']]
    });

    // Get vehicles with most maintenance
    const vehiclesWithMostMaintenance = maintenanceRecords.reduce((acc, record) => {
      const vehicleId = record.vehicle_id;
      if (!acc[vehicleId]) {
        acc[vehicleId] = {
          vehicle: record.vehicle,
          count: 0,
          cost: 0,
          records: []
        };
      }
      acc[vehicleId].count++;
      acc[vehicleId].cost += parseFloat(record.cost) || 0;
      acc[vehicleId].records.push(record);
      return acc;
    }, {});

    const topVehiclesByMaintenance = Object.values(vehiclesWithMostMaintenance)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    // Get upcoming maintenance
    const upcomingMaintenance = await Maintenance.findAll({
      where: {
        next_service_due_date: {
          [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        }
      },
      include: [
        {
          model: Vehicle,
          attributes: ['vehicle_number', 'make', 'model', 'status'],
          as: 'vehicle'
        }
      ],
      order: [['next_service_due_date', 'ASC']]
    });

    res.status(200).json({ 
      success: true,
      data: {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupBy: group_by
        },
        summary: {
          totalRecords: maintenanceRecords.length,
          totalCost: Math.round(totalCost * 100) / 100,
          averageCost: maintenanceRecords.length > 0 ? 
            Math.round((totalCost / maintenanceRecords.length) * 100) / 100 : 0
        },
        maintenanceByType,
        trends: maintenanceTrends,
        topVehiclesByMaintenance,
        upcomingMaintenance: upcomingMaintenance.slice(0, 10)
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

// 7️⃣ Performance metrics: system performance and KPIs
export const getPerformanceMetrics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get booking metrics
    const totalBookings = await Booking.count({
      where: {
        created_at: { [Op.gte]: startDate }
      }
    });

    const completedBookings = await Booking.count({
      where: {
        created_at: { [Op.gte]: startDate },
        status: 'completed'
      }
    });

    const activeBookings = await Booking.count({
      where: {
        created_at: { [Op.gte]: startDate },
        status: 'active'
      }
    });

    const cancelledBookings = await Booking.count({
      where: {
        created_at: { [Op.gte]: startDate },
        status: 'cancelled'
      }
    });

    // Calculate booking success rate
    const bookingSuccessRate = totalBookings > 0 ? 
      ((completedBookings + activeBookings) / totalBookings) * 100 : 0;

    // Get revenue metrics
    const totalRevenue = await Booking.sum('total_amount', {
      where: {
        created_at: { [Op.gte]: startDate },
        status: { [Op.in]: ['active', 'completed'] }
      }
    });

    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get vehicle metrics
    const totalVehicles = await Vehicle.count();
    const availableVehicles = await Vehicle.count({ where: { status: 'available' } });
    const maintenanceVehicles = await Vehicle.count({ where: { status: 'maintenance' } });
    const rentedVehicles = await Vehicle.count({ where: { status: 'rented' } });

    // Calculate fleet utilization
    const fleetUtilization = totalVehicles > 0 ? 
      ((rentedVehicles + maintenanceVehicles) / totalVehicles) * 100 : 0;

    // Get customer metrics
    const totalCustomers = await Customer.count();
    const newCustomers = await Customer.count({
      where: {
        created_at: { [Op.gte]: startDate }
      }
    });

    // Get maintenance metrics
    const maintenanceRecords = await Maintenance.count({
      where: {
        service_date: { [Op.gte]: startDate }
      }
    });

    const maintenanceCost = await Maintenance.sum('cost', {
      where: {
        service_date: { [Op.gte]: startDate }
      }
    });

    // Calculate key performance indicators
    const kpis = {
      bookingSuccessRate: Math.round(bookingSuccessRate * 100) / 100,
      fleetUtilization: Math.round(fleetUtilization * 100) / 100,
      averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      revenuePerVehicle: totalVehicles > 0 ? Math.round((totalRevenue / totalVehicles) * 100) / 100 : 0,
      maintenanceCostPerVehicle: totalVehicles > 0 ? Math.round((maintenanceCost / totalVehicles) * 100) / 100 : 0
    };

    res.status(200).json({ 
      success: true,
      data: {
        period: `${periodDays} days`,
        metrics: {
          bookings: {
            total: totalBookings,
            completed: completedBookings,
            active: activeBookings,
            cancelled: cancelledBookings,
            successRate: kpis.bookingSuccessRate
          },
          revenue: {
            total: Math.round(totalRevenue * 100) / 100,
            average: kpis.averageBookingValue,
            perVehicle: kpis.revenuePerVehicle
          },
          fleet: {
            total: totalVehicles,
            available: availableVehicles,
            rented: rentedVehicles,
            maintenance: maintenanceVehicles,
            utilization: kpis.fleetUtilization
          },
          customers: {
            total: totalCustomers,
            new: newCustomers
          },
          maintenance: {
            records: maintenanceRecords,
            cost: Math.round(maintenanceCost * 100) / 100,
            costPerVehicle: kpis.maintenanceCostPerVehicle
          }
        },
        kpis
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
