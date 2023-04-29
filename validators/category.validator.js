const Joi = require('joi');

const categorySchema = Joi.object({
    name: Joi.string().min(6).required(),
    icon: Joi.string().min(6).required(),
    //    color: Joi.string().allow("")
});

module.exports = categorySchema;