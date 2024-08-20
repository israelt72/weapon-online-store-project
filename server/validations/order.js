//order.js
import Joi from 'joi';

/**
 * Validate the creation of an order
 * @param {Object} orderInfo - The order data to validate
 * @param {string} orderInfo.userId - The ID of the user creating the order
 * @param {Array} orderInfo.products - An array of products in the order
 * @param {Object} orderInfo.products[].productId - The ID of the product
 * @param {number} orderInfo.products[].quantity - The quantity of the product
 * @param {number} orderInfo.total - The total price of the order
 * @param {string} orderInfo.status - The status of the order
 * @returns {Object} - The result of the validation
 */
export const createOrderValidation = (orderInfo) => {
    const schema = Joi.object({
        userId: Joi.string().required(),
        products: Joi.array().items(
            Joi.object({
                productId: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required()
            })
        ).required(),
        total: Joi.number().positive().required(),
        status: Joi.string().valid('pending', 'completed', 'shipped', 'delivered', 'cancelled').required()
    });
    return schema.validate(orderInfo);
};

/**
 * Validate the update of an order
 * @param {Object} orderInfo - The order update data to validate
 * @param {string} [orderInfo.status] - The updated status of the order
 * @returns {Object} - The result of the validation
 */
export const updateOrderValidation = (orderInfo) => {
    const schema = Joi.object({
        status: Joi.string().valid('pending', 'completed', 'shipped', 'delivered', 'cancelled')
    });
    return schema.validate(orderInfo);
};
