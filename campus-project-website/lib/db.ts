import mongoose from "mongoose"

// Use environment variable or fallback to the provided URI
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://campcare_db:okihavedonethis69@cluster0.w82a3zp.mongodb.net/Campcare?w=majority"

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI")
}

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  }
}

export async function connectDB() {
  // Force fresh connection to avoid cached schema issues
  cached.conn = null
  cached.promise = null

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }

  cached.conn = await cached.promise
  return cached.conn
}
