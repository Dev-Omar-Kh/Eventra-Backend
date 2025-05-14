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
        const { type, page = 1, limit = 10, latest } = req.query;

        const query = type ? { type } : {};
        const skip = (page - 1) * limit;

        let events = [];
        let totalEvents = 0;
        let totalPages = 0;

        if (latest === 'true') {

            events = await Event.find(query)
                .sort({ createdAt: -1 })
                .limit(8);

        } else {

            events = await Event.find(query)
                .skip(skip)
                .limit(Number(limit));

            totalEvents = await Event.countDocuments(query);
            totalPages = Math.ceil(totalEvents / limit);

        }

        let bookedEventIds = [];
        if (req.user) {
            const userBookings = await Booking.find({ user: req.user.id }).select('event');
            bookedEventIds = userBookings.map(booking => booking.event.toString());
        }

        const eventsWithBookingStatus = events.map(event => ({
            ...event.toObject(),
            isBooked: bookedEventIds.includes(event._id.toString())
        }));

        const types = await Event.distinct("type");

        res.json({
            events: eventsWithBookingStatus,
            types,
            ...(latest !== 'true' && {
                pagination: {
                    page: Number(page),
                    totalPages,
                    totalEvents
                }
            })
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
