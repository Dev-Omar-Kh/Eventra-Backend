const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { eventSchema } = require('../validations/eventValidation');

exports.createEvent = async (req, res) => {

    try {

        const { image, name, location, type, date, seatsNumber, slogan, description, agendaDetails, tags } = req.body;

        const newEvent = new Event({
            image,
            name,
            location,
            type,
            date,
            seatsNumber,
            slogan,
            description,
            agendaDetails,
            tags: tags || []
        });

        await newEvent.save();
        res.status(201).json(newEvent);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

exports.getAllEvents = async (req, res) => {

    try {

        const { type, page = 1, limit = 10 } = req.query;

        const query = type ? { type } : {};

        const skip = (page - 1) * limit;
        const events = await Event.find(query)
            .skip(skip)
            .limit(Number(limit));

        const totalEvents = await Event.countDocuments(query);

        const totalPages = Math.ceil(totalEvents / limit);

        let bookedEventIds = [];

        if (req.user) {
            const userBookings = await Booking.find({ user: req.user.id }).select('event');
            bookedEventIds = userBookings.map(booking => booking.event.toString());
        }

        const eventsWithBookingStatus = events.map(event => {
            return {
                ...event.toObject(),
                isBooked: bookedEventIds.includes(event._id.toString())
            };
        });

        const types = await Event.distinct("type");

        res.json({
            events: eventsWithBookingStatus,
            types,
            pagination: {
                page: Number(page),
                totalPages,
                totalEvents
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

exports.getEventById = async (req, res) => {

    try {

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        let isBooked = false;

        if (req.user) {
            const booking = await Booking.findOne({
                user: req.user.id,
                event: event._id
            });
            if (booking) {
                isBooked = true;
            }
        }

        res.json({
            ...event.toObject(),
            isBooked
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

exports.updateEvent = async (req, res) => {

    const { error } = eventSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

};

exports.deleteEvent = async (req, res) => {

    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
