import Payment from "../models/paymentModels/payment.model.js";
import Booking from "../models/bookingModels/booking.model.js";
import BookingExtra from "../models/bookingModels/bookingExtra.model.js";
import Vehicle from "../models/vehicleModels/vehicle.model.js";
import Customer from "../models/UserModels/customer.model.js";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

// 📌 Create a new payment for a booking
export const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentDate } = req.body;

    // Enhanced validation
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "bookingId and paymentMethod are required"
      });
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'];
    if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Must be one of: cash, credit_card, debit_card, upi, net_banking, wallet"
      });
    }

    // Validate booking ID
    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "bookingId must be a valid number"
      });
    }

    // Find booking with associations
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Vehicle, attributes: ['id', 'vehicle_number', 'make', 'model', 'daily_rate'], as: 'vehicle' },
        { model: Customer, attributes: ['id', 'full_name', 'email'], as: 'customer' },
        { model: BookingExtra, as: 'extras' }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if booking is in valid state for payment
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Cannot create payment for cancelled booking"
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ where: { bookingId } });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this booking"
      });
    }

    // Calculate rental cost using booking data
    const totalDays = booking.total_days;
    const dailyRate = parseFloat(booking.daily_rate);
    const baseAmount = parseFloat(booking.base_amount);
    const taxAmount = parseFloat(booking.tax_amount);
    const extrasAmount = parseFloat(booking.extras_amount) || 0;
    const securityDeposit = parseFloat(booking.security_deposit);
    const totalAmount = parseFloat(booking.total_amount);

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      paymentMethod: paymentMethod.toLowerCase(),
      amount: baseAmount,
      tax: taxAmount,
      securityDeposit,
      extrasTotal: extrasAmount,
      penalties: 0,
      status: "Pending",
      paymentDate: paymentDate || new Date()
    });

    // Fetch created payment with associations
    const createdPayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Booking,
          attributes: ['id', 'pickup_date', 'return_date', 'total_days', 'status'],
          as: 'booking'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Payment record created successfully",
      data: {
        payment: createdPayment,
        booking: {
          id: booking.id,
          vehicle: booking.vehicle,
          customer: booking.customer,
          totalAmount,
          breakdown: {
            baseAmount,
            taxAmount,
            extrasAmount,
            securityDeposit,
            totalAmount
          }
        }
      }
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message
    });
  }
};

// 📌 Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate payment ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment ID is required"
      });
    }

    // Validate status
    const validStatuses = ['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: Pending, Paid, Failed, Refunded, Cancelled"
      });
    }

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Booking,
          attributes: ['id', 'pickup_date', 'return_date', 'status'],
          as: 'booking'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check if payment can be updated
    if (payment.status === 'Paid' && status !== 'Refunded') {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of completed payment"
      });
    }

    // Update payment status
    payment.status = status;
    if (notes) {
      payment.notes = notes;
    }
    await payment.save();

    // Update booking status if payment is successful
    if (status === 'Paid' && payment.booking) {
      payment.booking.status = 'confirmed';
      await payment.booking.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message
    });
  }
};

// 📌 Get payment by booking
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate booking ID
    if (!bookingId || isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Valid booking ID is required"
      });
    }

    const payment = await Payment.findOne({
      where: { bookingId },
      include: [
        {
          model: Booking,
          attributes: ['id', 'pickup_date', 'return_date', 'total_days', 'status'],
          as: 'booking'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No payment record found for this booking"
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message
    });
  }
};

// 📌 Issue Refund (Security deposit or adjustments)
export const issueRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, reason, notes } = req.body;

    // Validate payment ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment ID is required"
      });
    }

    // Validate refund amount
    if (!refundAmount || isNaN(refundAmount) || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid refund amount is required"
      });
    }

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Booking,
          attributes: ['id', 'pickup_date', 'return_date', 'status'],
          as: 'booking'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check if payment is eligible for refund
    if (payment.status !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: "Only paid payments can be refunded"
      });
    }

    // Check refund amount limits
    const maxRefundAmount = payment.securityDeposit + payment.amount;
    if (refundAmount > maxRefundAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed ${maxRefundAmount}`
      });
    }

    // Update payment status and add refund details
    payment.status = "Refunded";
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundNotes = notes;
    payment.refundDate = new Date();
    await payment.save();

    // Update booking status if full refund
    if (refundAmount >= payment.amount && payment.booking) {
      payment.booking.status = 'cancelled';
      await payment.booking.save();
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        payment,
        refundDetails: {
          amount: refundAmount,
          reason,
          date: payment.refundDate
        }
      }
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message
    });
  }
};

// 📌 Get all payments with filtering and pagination
export const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentMethod,
      start_date,
      end_date,
      sort_by = 'paymentDate',
      sort_order = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }
    
    if (start_date && end_date) {
      whereClause.paymentDate = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const limitNum = parseInt(limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      order: [[sort_by, sort_order.toUpperCase()]],
      include: [
        {
          model: Booking,
          attributes: ['id', 'pickup_date', 'return_date', 'total_days', 'status'],
          as: 'booking'
        }
      ],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        payments,
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
    console.error('Error fetching all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// 📌 Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment ID is required"
      });
    }

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Booking,
          attributes: ['id', 'pickup_date', 'return_date', 'total_days', 'status'],
          as: 'booking'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

// 📌 Get payment analytics and statistics
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'month' } = req.query;

    // Build where clause for date range
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.paymentDate = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Get total payments
    const totalPayments = await Payment.count({ where: whereClause });

    // Get payments by status
    const paymentsByStatus = await Payment.findAll({
      where: whereClause,
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_amount']
      ],
      group: ['status'],
      raw: true
    });

    // Get payments by method
    const paymentsByMethod = await Payment.findAll({
      where: whereClause,
      attributes: [
        'paymentMethod',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_amount']
      ],
      group: ['paymentMethod'],
      raw: true
    });

    // Get total revenue
    const totalRevenue = await Payment.sum('amount', { 
      where: { ...whereClause, status: 'Paid' } 
    });

    // Get total refunds
    const totalRefunds = await Payment.sum('refundAmount', { 
      where: { ...whereClause, status: 'Refunded' } 
    });

    // Get payment trends by time period
    let groupFunction;
    switch (group_by) {
      case 'day':
        groupFunction = Sequelize.fn('DATE', Sequelize.col('paymentDate'));
        break;
      case 'week':
        groupFunction = Sequelize.fn('DATE_TRUNC', 'week', Sequelize.col('paymentDate'));
        break;
      case 'month':
        groupFunction = Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('paymentDate'));
        break;
      default:
        groupFunction = Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('paymentDate'));
    }

    const paymentTrends = await Payment.findAll({
      where: whereClause,
      attributes: [
        [groupFunction, 'period'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_amount']
      ],
      group: [groupFunction],
      order: [[groupFunction, 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPayments,
          totalRevenue: totalRevenue || 0,
          totalRefunds: totalRefunds || 0,
          netRevenue: (totalRevenue || 0) - (totalRefunds || 0)
        },
        paymentsByStatus,
        paymentsByMethod,
        trends: paymentTrends
      }
    });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment analytics',
      error: error.message
    });
  }
};

// 📌 Get payment statistics for dashboard
export const getPaymentStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get payments in the period
    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.gte]: startDate
        }
      }
    });

    // Calculate statistics
    const totalAmount = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    const paidPayments = payments.filter(p => p.status === 'Paid');
    const pendingPayments = payments.filter(p => p.status === 'Pending');
    const failedPayments = payments.filter(p => p.status === 'Failed');
    const refundedPayments = payments.filter(p => p.status === 'Refunded');

    // Group by payment method
    const byMethod = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count++;
      acc[method].amount += parseFloat(payment.amount) || 0;
      return acc;
    }, {});

    // Calculate success rate
    const successRate = payments.length > 0 ? 
      (paidPayments.length / payments.length) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        period: `${periodDays} days`,
        totalPayments: payments.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        byStatus: {
          paid: paidPayments.length,
          pending: pendingPayments.length,
          failed: failedPayments.length,
          refunded: refundedPayments.length
        },
        byMethod,
        averageAmount: payments.length > 0 ? 
          Math.round((totalAmount / payments.length) * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
};
