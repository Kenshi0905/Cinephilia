import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "cinephilia";

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  // Always create a fresh client for serverless to avoid topology issues
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 1,
      retryWrites: true,
      serverSelectionTimeoutMS: 10000,
    });
    try {
      await cachedClient.connect();
    } catch (err) {
      cachedClient = null;
      throw err;
    }
  }

  // Ping to verify connection is alive
  try {
    const db = cachedClient.db(dbName);
    await db.admin().ping();
    cachedDb = db;
    return cachedDb;
  } catch (err) {
    // Connection dead, reset and retry
    if (cachedClient) {
      await cachedClient.close().catch(() => {});
      cachedClient = null;
      cachedDb = null;
    }
    
    // Reconnect
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 1,
      retryWrites: true,
      serverSelectionTimeoutMS: 10000,
    });
    await cachedClient.connect();
    cachedDb = cachedClient.db(dbName);
    return cachedDb;
  }
}

export async function getCollection<T = unknown>(name: string) {
  const db = await getDb();
  return db.collection<T>(name);
}
