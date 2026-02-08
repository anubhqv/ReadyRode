const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const bookingController = require('../controllers/bookingController');
const Booking = require('../models/Booking'); 


router.post('/', auth, bookingController.createBooking);
router.get('/user/:userId', auth, bookingController.getUserBookings);
router.get('/admin/all', auth, adminAuth, bookingController.getAllBookingsAdmin);
router.delete('/:id', auth,  bookingController.deletebooking);

module.exports = router;