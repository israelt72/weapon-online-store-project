//review.js

import Joi from 'joi';

// Validation schema for creating a review
export const createReviewValidation = (reviewInfo) => {
    const schema = Joi.object({
        productId: Joi.string(),  
        rating: Joi.number().integer().min(1).max(5), 
        comment: Joi.string().min(5).max(500)  
    });
    return schema.validate(reviewInfo);  
};

// Validation schema for updating a review
export const updateReviewValidation = (reviewInfo) => {
    // Exclude _id from the update schema
    const schema = Joi.object({
        rating: Joi.number().integer().min(1).max(5).optional(),  // Rating can be a number between 1 and 5, but is optional
        comment: Joi.string().min(2).max(1000).optional(),  // Comment can be a string with 5 to 1000 characters, but is optional
    }).unknown(true); // Allow additional fields, but not specifically _id

    // Return the result of the validation
    return schema.validate(reviewInfo);  
};
