const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    image: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    seatsNumber: { type: Number, required: true },
    slogan: { type: String, required: true },
    description: { type: String, required: true },
    agendaDetails: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
