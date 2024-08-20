//review.js
import Joi from 'joi';

/**
 * Validate the creation of a new review
 * @param {Object} reviewInfo - The review data to validate
 * @param {string} reviewInfo.productId - The product ID for the review
 * @param {number} reviewInfo.rating - The rating given in the review (between 1 and 5)
 * @param {string} reviewInfo.comment - The comment of the review (5 to 1000 characters)
 * @returns {Object} - The result of the validation
 */
export const createReviewValidation = (reviewInfo) => {
    const schema = Joi.object({
        productId: Joi.string().required(),  // Product ID must be a string and cannot be empty
        rating: Joi.number().integer().min(1).max(5).required(),  // Rating must be an integer between 1 and 5
        comment: Joi.string().min(5).max(1000).required()  // Comment must be a string with 5 to 1000 characters
    });
    return schema.validate(reviewInfo);  // Return the result of the validation
};

/**
 * Validate the update of an existing review
 * @param {Object} reviewInfo - The review update data to validate
 * @param {number} [reviewInfo.rating] - The updated rating (between 1 and 5, optional)
 * @param {string} [reviewInfo.comment] - The updated comment (5 to 1000 characters, optional)
 * @returns {Object} - The result of the validation
 */
export const updateReviewValidation = (reviewInfo) => {
    const schema = Joi.object({
        rating: Joi.number().integer().min(1).max(5),  // Rating can be a number between 1 and 5, but is optional
        comment: Joi.string().min(5).max(1000)  // Comment can be a string with 5 to 1000 characters, but is optional
    });
    return schema.validate(reviewInfo);  // Return the result of the validation
};
