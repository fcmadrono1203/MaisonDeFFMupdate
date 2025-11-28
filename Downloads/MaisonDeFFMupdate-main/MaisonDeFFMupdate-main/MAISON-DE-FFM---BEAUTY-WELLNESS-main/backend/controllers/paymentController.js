const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const errorHandler = require('../middleware/errorHandler.js');

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, method, amount, cardDetails, paymentScreenshot } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorHandler(res, 404, 'Booking not found');
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment) {
      return errorHandler(res, 400, 'Payment already processed for this booking');
    }

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      amount,
      method,
      status: 'PENDING',
      transactionId: `TXN-${Date.now()}`,
      paymentScreenshot,
      cardDetails,
    });

    await payment.save();

    // Update booking payment status
    booking.paymentStatus = 'pending';
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
      },
    });
  } catch (error) {
    errorHandler(res, 500, 'Error processing payment', error);
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'COMPLETED' },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return errorHandler(res, 404, 'Payment not found');
    }

    // Update booking payment status
    await Booking.findByIdAndUpdate(
      payment.booking,
      { paymentStatus: 'paid' }
    );

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      payment,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error confirming payment', error);
  }
};

// Get payment by booking ID
exports.getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
      return errorHandler(res, 404, 'Payment not found');
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error fetching payment', error);
  }
};