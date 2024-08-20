//auth.js
import Joi from 'joi';

/**
 * Validate registration information
 * @param {Object} authInfo - The registration data to validate
 * @param {string} authInfo.firstName - The user's first name
 * @param {string} authInfo.lastName - The user's last name
 * @param {string} authInfo.email - The user's email address
 * @param {string} authInfo.password - The user's password
 * @returns {Object} - The result of the validation
 */
export const registerValidation = (authInfo) => {
    const schema = Joi.object({
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(authInfo);
};

/**
 * Validate login information
 * @param {Object} authInfo - The login data to validate
 * @param {string} authInfo.email - The user's email address
 * @param {string} authInfo.password - The user's password
 * @returns {Object} - The result of the validation
 */
export const loginValidation = (authInfo) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(authInfo);
};
