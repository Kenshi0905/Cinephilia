import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient } from "mongodb";
import type { Movie } from "./types";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  let client: MongoClient | null = null;
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "MONGODB_URI not set" }));
      return;
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "cinephilia");
    const col = db.collection<Movie>("movies");

    const indexInfo = await col.createIndex({ id: 1 }, { unique: true });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Database initialized", indexName: indexInfo }));
  } catch (err: any) {
    if (err?.code === 11000 || err?.message?.includes("E11000")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Index already exists" }));
      return;
    }

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err?.message || "Error" }));
  } finally {
    if (client) await client.close().catch(() => {});
  }
}
