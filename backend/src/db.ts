import mongoose from 'mongoose';
import { CONFIG } from './config';

let mongoConnection: typeof mongoose | null = null;

interface ConnectionOptions {
  serverSelectionTimeoutMS?: number;
  connectTimeoutMS?: number;
  heartbeatFrequencyMS?: number;
}

export async function connectToDatabase(options: ConnectionOptions = {}) {
  if (!mongoConnection) {
    try {
      // Default options with test environment considerations
      const defaultOptions = {
        serverSelectionTimeoutMS: process.env.NODE_ENV === 'test' ? 500 : 5000,
        connectTimeoutMS: process.env.NODE_ENV === 'test' ? 500 : 5000,
        heartbeatFrequencyMS: process.env.NODE_ENV === 'test' ? 500 : 10000,
      };
      
      // Merge default options with provided options
      const connectionOptions = { ...defaultOptions, ...options };
      
      mongoConnection = await mongoose.connect(CONFIG.MONGODB_URI, connectionOptions);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      mongoConnection = null;
      throw new Error('Failed to connect to MongoDB');
    }
  }
  return mongoConnection;
}

export async function disconnectFromDatabase() {
  if (mongoConnection) {
    try {
      await mongoose.disconnect();
      mongoConnection = null;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}
