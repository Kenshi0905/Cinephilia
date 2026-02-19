import { MongoClient } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  if (!globalThis.__mongoClientPromise) {
    const client = new MongoClient(uri, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    globalThis.__mongoClientPromise = client.connect().catch((error) => {
      globalThis.__mongoClientPromise = undefined;
      throw error;
    });
  }

  return globalThis.__mongoClientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "cinephilia");
}

export async function getCollection<T = Record<string, unknown>>(name: string) {
  const db = await getDb();
  return db.collection<T>(name);
}
