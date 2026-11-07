import express, { type Express, type Request, type Response } from "express";
import * as store from "./store";

function parsePageParam(value: unknown): number | undefined | null {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get("/tasks", (req: Request, res: Response) => {
    const status = req.query.status;
    if (status !== undefined && status !== "done" && status !== "open") {
      return res.status(400).json({ error: "status must be 'open' or 'done'" });
    }
    const filter = status;

    const limit = parsePageParam(req.query.limit);
    const offset = parsePageParam(req.query.offset);
    if (limit === null || offset === null) {
      return res.status(400).json({ error: "limit and offset must be non-negative integers" });
    }

    const tasks = store.all(filter);
    const start = offset ?? 0;
    const page = limit === undefined ? tasks.slice(start) : tasks.slice(start, start + limit);
    res.json(page);
  });

  app.post("/tasks", (req: Request, res: Response) => {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) return res.status(400).json({ error: "Title is required" });
    const task = store.add(title);
    res.status(201).json(task);
  });

  app.patch("/tasks/:id", (req: Request, res: Response) => {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) return res.status(400).json({ error: "Title is required" });
    const task = store.rename(Number(req.params.id), title);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.patch("/tasks/:id/toggle", (req: Request, res: Response) => {
    const task = store.toggle(Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.delete("/tasks/:id", (req: Request, res: Response) => {
    if (!store.remove(Number(req.params.id))) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).end();
  });

  return app;
}
