const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.bookEvent = async (req, res) => {

    try {

        const userId = req.user.id;
        const { eventId } = req.body;

        const existingBooking = await Booking.findOne({ user: userId, event: eventId });
        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked this event.' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.seatsNumber <= 0) {
            return res.status(400).json({ message: 'No seats available.' });
        }

        event.seatsNumber -= 1;
        await event.save();

        const booking = new Booking({ user: userId, event: eventId });
        await booking.save();

        res.status(201).json({ message: 'Booking successful!', booking });

    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }

};

exports.getUserBookings = async (req, res) => {

    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('event');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }

};

exports.cancelBooking = async (req, res) => {

    try {

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        const event = await Event.findById(booking.event);
        if (event) {
            event.seatsNumber += 1;
            await event.save();
        }

        await booking.deleteOne();
        res.json({ message: 'Booking canceled successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }

};
