import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    // ⚠️ TEMPORARILY HARDCODED: Bypassing the stubborn .env cache
    const mongoUri = 'mongodb://127.0.0.1:27017/calorix';

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully (Local)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};