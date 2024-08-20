//validateObjectId.js
import mongoose from 'mongoose';

/**
 * Validate if the given ID is a valid MongoDB ObjectId
 * @param {string} id - The ID to be validated
 * @returns {boolean} - Whether the ID is valid or not
 */
export const validateObjectId = (_id) => {
    return mongoose.Types.ObjectId.isValid(_id);
};
