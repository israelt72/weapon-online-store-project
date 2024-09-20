//product.js
import Joi from 'joi';


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
                _id: Joi.string().optional(),
                user: Joi.string().required(),
                rating: Joi.number().min(1).max(5).required(),
                comment: Joi.string().max(1000).optional()
            })
        ).optional(),
        createdAt: Joi.date().optional()  
    });
    return schema.validate(productInfo);
};


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
                _id: Joi.string().optional(),
                user: Joi.string().optional(),
                rating: Joi.number().min(1).max(5).optional(),
                comment: Joi.string().max(1000).optional()
            })
        ).optional(),
        createdAt: Joi.date().optional() 
    });
    return schema.validate(productInfo);
};
