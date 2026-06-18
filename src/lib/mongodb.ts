import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn("Please define the MONGODB_URI environment variable inside .env. Build may proceed if this is a static phase.");
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
      // In strict production run, but during static generation we might just return null or throw later.
      // Usually it's better to just throw, but we must not throw at module load.
      throw new Error("Please define the MONGODB_URI environment variable inside .env");
    }
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
