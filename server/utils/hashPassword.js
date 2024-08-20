// hashPassword.js
import bcrypt from 'bcryptjs';

// Hash a password with bcrypt
export const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare a plaintext password with a hashed password
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
