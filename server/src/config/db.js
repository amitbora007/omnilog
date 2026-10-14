import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('⚠️ MONGO_URI is not defined in environment variables. Database operations will fail.');
      mongoose.set('bufferCommands', false);
      return null;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.reason && error.reason.servers) {
      for (const [address, server] of error.reason.servers) {
        if (server.error) {
          console.error(`   - ${address}: ${server.error.message}`);
        }
      }
    }
    // Do not crash server in dev mode if DB is unavailable, allowing testing of standalone routes
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
