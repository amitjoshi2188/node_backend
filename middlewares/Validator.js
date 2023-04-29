//* middlewares/Validator.js
//* Include joi to check error type 
const Joi = require('joi');
//* Include all validators
const Validators = require('../validators')
const httpStatus = require("http-status-codes");

module.exports = function (validator) {
    //! If validator is not exist, throw err
    if (!Validators.hasOwnProperty(validator))
        throw new Error(`'${validator}' validator is not exist`)

    return async function (req, response, next) {
        try {

            const options = {
                abortEarly: false, // include all errors
                //   allowUnknown: true, // ignore unknown props
                stripUnknown: true, // remove unknown props
                errors: {
                    wrap: {
                        label: false
                    }
                }
            };
            const validated = await Validators[validator].validateAsync(req.body, options)
            req.body = validated
            next()
        } catch (error) {
            if (error) {
                console.log(error);
                let errorsArray = [];

                error.details.forEach(element => {
                    console.log(element.message);
                    errorsArray.push(element.message);
                });

                return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: errorsArray,
                });
            }
        }
    }
}
