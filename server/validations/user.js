//user.js
import Joi from 'joi';



 
export const updateUserValidation = (userInfo) => {
    const schema = Joi.object({
      
            firstName: Joi.string().min(2).required(),  
            lastName: Joi.string().min(2).required(),  
            email: Joi.string().email().required(),  
            password: Joi.string().min(5).required(), 
            currentPassword: Joi.string().min(5)  
        });
    return schema.validate(userInfo);  // Return the result of the validation
};
