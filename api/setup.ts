import type { IncomingMessage, ServerResponse } from "http";
import type { Movie } from "./types";
import { getCollection } from "./_lib/mongo";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    const col = await getCollection<Movie>("movies");

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
  }
}
