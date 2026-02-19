import { MongoClient, Db } from "mongodb";

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "cinephilia";

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  // Create a fresh client for each request in serverless
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

export async function getCollection<T = unknown>(name: string) {
  const db = await getDb();
  return db.collection<T>(name);
}
