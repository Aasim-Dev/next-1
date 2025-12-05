import mongoose from 'mongoose';

export { default as User } from './models/User.js';
export { default as Product } from './models/Product.js';
export { default as Order } from './models/Order.js';
export { default as Cart } from './models/Cart.js';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('📦 Using existing MongoDB connection');
        return;
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined');
    }

    try {
        await mongoose.connect(mongoUri);
        isConnected = true;
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        throw error;
    }
};

export const disconnectDB = async () => {
    if (!isConnected) return;

    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB Disconnected');
};
