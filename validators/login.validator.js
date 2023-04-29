const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required()
}).with('email', 'password');

module.exports = loginSchema;