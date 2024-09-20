//order.js
import Joi from 'joi';

export const createOrderValidation = (orderInfo) => {
    const schema = Joi.object({
        user: Joi.string().required(),  // Ensure user is required for order creation
        products: Joi.array().items(
            Joi.object({
                product: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required()
            })
        ).required(),
        total: Joi.number().positive().required(),
        status: Joi.string().valid('pending', 'completed', 'shipped', 'cancelled').optional()
    });
    return schema.validate(orderInfo);
};


export const updateOrderValidation = (orderInfo) => {
    const schema = Joi.object({
        user: Joi.string().optional(),  
        status: Joi.string().valid('pending', 'completed', 'shipped', 'cancelled').optional(),
        products: Joi.array().items(
            Joi.object({
                product: Joi.string().optional(),
                quantity: Joi.number().integer().min(1).optional()
            })
        ).optional()
    });
    return schema.validate(orderInfo);
};
