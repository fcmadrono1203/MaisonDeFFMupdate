const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { sendBookingConfirmation } = require('../config/email');
const errorHandler = require('../middleware/errorHandler.js');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      date,
      time,
      service,
      beautician,
      address,
      specialRequests,
      homeService,
    } = req.body;

    // Validate date is not in the past
    const bookingDate = new Date(date);
    if (bookingDate < new Date()) {
      return errorHandler(res, 400, 'Booking date cannot be in the past');
    }

    // Check if time slot is available
    const existingBooking = await Booking.findOne({
      date: bookingDate,
      time,
      beautician,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      return errorHandler(res, 400, 'This time slot is already booked');
    }

    // Get service details
    const serviceDetails = await Service.findById(service);
    if (!serviceDetails || !serviceDetails.isActive) {
      return errorHandler(res, 404, 'Service not found or unavailable');
    }

    // Calculate total price
    const homeServiceFee = homeService ? 200 : 0;
    const totalPrice = serviceDetails.price + homeServiceFee;

    // Create booking
    const booking = new Booking({
      customerName,
      phone,
      email,
      date: bookingDate,
      time,
      service,
      serviceName: serviceDetails.name,
      price: serviceDetails.price,
      beautician,
      address,
      specialRequests,
      homeServiceFee,
      totalPrice,
    });

    await booking.save();

    // Send confirmation email
    try {
      await sendBookingConfirmation({
        customerName,
        email,
        serviceName: serviceDetails.name,
        date: bookingDate,
        time,
        beautician,
        address,
        totalPrice,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        customerName: booking.customerName,
        serviceName: booking.serviceName,
        date: booking.date,
        time: booking.time,
        beautician: booking.beautician,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (error) {
    errorHandler(res, 500, 'Error creating booking', error);
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('service', 'name category price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error fetching bookings', error);
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name category price description');

    if (!booking) {
      return errorHandler(res, 404, 'Booking not found');
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error fetching booking', error);
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return errorHandler(res, 404, 'Booking not found');
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      booking,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error updating booking status', error);
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return errorHandler(res, 404, 'Booking not found');
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    errorHandler(res, 500, 'Error deleting booking', error);
  }
};