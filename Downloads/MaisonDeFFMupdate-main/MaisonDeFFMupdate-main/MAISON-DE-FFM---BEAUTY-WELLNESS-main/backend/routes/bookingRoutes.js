const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Public routes
router.post('/', validateBooking, bookingController.createBooking);
router.get('/', auth, bookingController.getAllBookings);
router.get('/:id', auth, bookingController.getBookingById);

// Admin routes (add authentication middleware)
router.put('/:id/status', auth, bookingController.updateBookingStatus);
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;