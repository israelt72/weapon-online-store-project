//validateObjectId.js
import mongoose from 'mongoose';


 
export const validateObjectId = (_id) => {
    return mongoose.Types.ObjectId.isValid(_id);
};
