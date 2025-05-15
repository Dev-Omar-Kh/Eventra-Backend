const Joi = require('joi');

exports.eventSchema = Joi.object({
    image: Joi.string().uri().required(),
    name: Joi.string().min(3).max(100).required(),
    location: Joi.string().required(),
    type: Joi.string().required(),
    date: Joi.date().required(),
    seatsNumber: Joi.number().integer().min(1).required(),
    slogan: Joi.string().required(),
    description: Joi.string().required(),
    agendaDetails: Joi.array().items(Joi.string()).required()
});
