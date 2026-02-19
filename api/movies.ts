import type { IncomingMessage, ServerResponse } from "http";
import type { Movie } from "./types";
import { getCollection } from "./_lib/mongo";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const limit = Number.parseInt(url.searchParams.get("limit") || "200", 10) || 200;
    const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10) || 0;

    const col = await getCollection<Movie>("movies");

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
  }
}
