// config.js
import dotenv from 'dotenv';

dotenv.config();

export const dbUri = process.env.MONGODB_URL;
