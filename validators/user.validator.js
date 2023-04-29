const Joi = require('joi');

const userSchema = Joi.object({
    userId: Joi.string()
    // email: Joi.string().email().required(),
    // password: Joi.string().min(5).required()
});

module.exports = userSchema;