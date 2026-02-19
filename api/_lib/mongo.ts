import { MongoClient } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  if (!globalThis.__mongoClientPromise) {
    const client = new MongoClient(uri);
    globalThis.__mongoClientPromise = client.connect();
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
