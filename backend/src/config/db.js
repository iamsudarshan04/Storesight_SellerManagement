import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('⚠️  Server will continue running without database connection');
        console.log('💡 Please whitelist your IP in MongoDB Atlas or use local MongoDB');
        // Don't exit - allow server to run
        // process.exit(1);
    }
};

// MongoDB connection configured
export default connectDB;
