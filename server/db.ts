import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocksense';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[StockSense MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error(`[StockSense MongoDB] Connection error: ${error.message}`);
    if (error.message?.includes('bad auth') || error.message?.includes('authentication failed')) {
      console.error(`[StockSense MongoDB] 💡 HINT: Check the username and password in your .env (MONGODB_URI).`);
      console.error(`[StockSense MongoDB] 💡 If your password contains special characters like '@', '#', or '%', URL-encode them (e.g. '@' -> '%40').`);
      console.error(`[StockSense MongoDB] 💡 To run locally without password, set MONGODB_URI=mongodb://127.0.0.1:27017/stocksense in .env`);
    }
    throw error;
  }
};
