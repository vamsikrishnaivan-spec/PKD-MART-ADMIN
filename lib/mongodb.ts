import mongoose, { type Mongoose } from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable')
}

// 👇 Declare a properly typed global for hot-reload caching
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined
}

// 👇 Initialize global cache if it doesn't exist
if (!global._mongooseCache) {
  global._mongooseCache = { conn: null, promise: null }
}

// 👇 Now safely reference the cache
const cached = global._mongooseCache

export async function getDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
