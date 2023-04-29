const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
    phone: Joi.string().min(10).required()
});

module.exports = registerSchema;