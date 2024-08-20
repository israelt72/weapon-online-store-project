// config.js
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the configuration object
const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/mydatabase',
  TOKEN_SECRET: process.env.TOKEN_SECRET,
};


// Validate required environment variables
if (!config.TOKEN_SECRET) {
  throw new Error('TOKEN_SECRET is not defined in the environment variables.');
}

export default config;
