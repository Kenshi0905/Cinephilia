import { MongoClient } from "mongodb";

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(process.env.MONGODB_DB || "cinephilia");
}

export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}
