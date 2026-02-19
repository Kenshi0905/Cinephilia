import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient } from "mongodb";
import type { Movie } from "./types";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  let client: MongoClient | null = null;
  try {
    if (req.method !== "GET") {
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

    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const limit = Number.parseInt(url.searchParams.get("limit") || "200", 10) || 200;
    const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10) || 0;

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "cinephilia");
    const col = db.collection<Movie>("movies");

    const movies = await col
      .find({}, { projection: { _id: 0 } })
      .sort({ watchedDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ movies }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err?.message || "Error" }));
  } finally {
    if (client) await client.close().catch(() => {});
  }
}
