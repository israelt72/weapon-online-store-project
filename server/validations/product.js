
//product.js
import Joi from 'joi';

/**
 * Validate the creation of a product
 * @param {Object} productInfo - The product data to validate
 * @returns {Object} - The result of the validation
 */
export const createProductValidation = (productInfo) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        description: Joi.string().min(10).max(1000).required(),
        image: Joi.string().optional(),
        price: Joi.number().positive().required(),
        category: Joi.string().min(3).max(255).required(),
        stock: Joi.number().integer().min(0).required(),
        reviews: Joi.array().items(
            Joi.object({
                user: Joi.string().required(),
                rating: Joi.number().min(1).max(5).required(),
                comment: Joi.string().max(1000).optional()
            })
        ).optional()
    });
    return schema.validate(productInfo);
};

/**
 * Validate the update of a product
 * @param {Object} productInfo - The product update data to validate
 * @returns {Object} - The result of the validation
 */
export const updateProductValidation = (productInfo) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).optional(),
        description: Joi.string().min(10).max(1000).optional(),
        image: Joi.string().optional(),
        price: Joi.number().positive().optional(),
        category: Joi.string().min(3).max(255).optional(),
        stock: Joi.number().integer().min(0).optional(),
        reviews: Joi.array().items(
            Joi.object({
                user: Joi.string().optional(),
                rating: Joi.number().min(1).max(5).optional(),
                comment: Joi.string().max(1000).optional()
            })
        ).optional()
    });
    return schema.validate(productInfo);
};
