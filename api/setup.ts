import type { IncomingMessage, ServerResponse } from "http";
import { getCollection } from "./_lib/mongo.js";
import type { Movie } from "./types.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    const col = await getCollection<Movie>("movies");

    // Create unique index on id field to ensure no duplicate upserts
    const indexInfo = await col.createIndex({ id: 1 }, { unique: true });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ 
      message: "Database initialized",
      indexName: indexInfo
    }));
  } catch (err: any) {
    // If index already exists, that's ok
    if (err?.code === 11000 || err?.message?.includes("E11000")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Index already exists" }));
      return;
    }

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err?.message || "Internal Server Error" }));
  }
}
