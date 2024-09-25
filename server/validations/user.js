//user.js
import Joi from 'joi';

export const updateUserValidation = (userInfo) => {
    const schema = Joi.object({
        _id: Joi.string().optional(),
        firstName: Joi.string().min(2).optional().messages({
            
        }),
        lastName: Joi.string().min(2).optional().messages({
            
        }),
        email: Joi.string().email().optional().messages({
        }),
        password: Joi.string().min(5).optional().messages({
        }),
        role: Joi.string().optional().valid('admin', 'user').messages({
        }),
        currentPassword: Joi.string().optional().messages({
        }),
        orders: Joi.array().items(Joi.string()).optional(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional(),
        __v:Joi.number().optional(),


    });

    return schema.validate(userInfo);
};