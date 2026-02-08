const Booking = require('../models/Booking');
const Car = require('../models/Car');


exports.createBooking = async (req, res) => {
    try {
        const { car, startDate, endDate, pickupLocation } = req.body;
        const userId = req.user.id;

        const carData = await Car.findById(car);
        if (!carData) return res.status(404).json({ msg: "Car not found" });

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) return res.status(400).json({ msg: "End date must be after start date" });

        
        const overlapping = await Booking.findOne({
            car,
            $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }]
        });

        if (overlapping) return res.status(400).json({ msg: "Car is already booked for these dates" });

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = days * carData.pricePerDay;

        const booking = new Booking({
            car, user: userId, startDate, endDate, pickupLocation, totalPrice, status: "Confirmed"
        });

        await booking.save();
        res.status(201).json({ message: "Booking confirmed!", booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId }).populate('car');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllBookingsAdmin = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user', 'firstName lastName').populate('car', 'make model');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletebooking = async (req, res) => {
    try {
        
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking record not found' });
        }

        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to cancel this booking' });
        }

        
        await Booking.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Booking cancelled successfully' });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};