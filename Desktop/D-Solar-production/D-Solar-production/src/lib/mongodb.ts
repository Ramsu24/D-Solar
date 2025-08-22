import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log('Using existing MongoDB connection');
      return;
    }

    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    await mongoose.connect(MONGODB_URI, opts);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB; 