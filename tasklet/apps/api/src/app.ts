import express, { type Express, type Request, type Response } from "express";
import * as store from "./store";

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get("/tasks", (req: Request, res: Response) => {
    const status = req.query.status;
    const filter = status === "done" || status === "open" ? status : undefined;
    res.json(store.all(filter));
  });

  app.post("/tasks", (req: Request, res: Response) => {
    const task = store.add(req.body.title);
    res.status(201).json(task);
  });

  app.patch("/tasks/:id/toggle", (req: Request, res: Response) => {
    const task = store.toggle(Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.delete("/tasks/:id", (req: Request, res: Response) => {
    store.remove(Number(req.params.id));
    res.status(204).end();
  });

  return app;
}
