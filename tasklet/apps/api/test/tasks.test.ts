import { test, beforeEach } from "node:test";
import assert from "node:assert";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../src/app";
import * as store from "../src/store";

let app: Express;
beforeEach(() => {
  store.reset();
  app = createApp();
});

test("GET /health returns ok", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
});

test("POST /tasks creates a task", async () => {
  const res = await request(app).post("/tasks").send({ title: "Write docs" });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.title, "Write docs");
  assert.strictEqual(res.body.done, false);
});

test("PATCH /tasks/:id/toggle flips done", async () => {
  const created = await request(app).post("/tasks").send({ title: "Ship it" });
  const res = await request(app).patch(`/tasks/${created.body.id}/toggle`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.done, true);
});

test("PATCH toggle on missing task returns 404", async () => {
  const res = await request(app).patch("/tasks/999/toggle");
  assert.strictEqual(res.status, 404);
});

test("GET /tasks?status=done returns only completed tasks", async () => {
  const open = await request(app).post("/tasks").send({ title: "Open task" });
  const done = await request(app).post("/tasks").send({ title: "Done task" });
  await request(app).patch(`/tasks/${done.body.id}/toggle`);

  const res = await request(app).get("/tasks?status=done");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(
    res.body.map((t: { id: number }) => t.id),
    [done.body.id],
  );
  assert.ok(res.body.every((t: { done: boolean }) => t.done));
  assert.ok(!res.body.some((t: { id: number }) => t.id === open.body.id));
});

test("GET /tasks?status=open returns only unfinished tasks", async () => {
  const open = await request(app).post("/tasks").send({ title: "Open task" });
  const done = await request(app).post("/tasks").send({ title: "Done task" });
  await request(app).patch(`/tasks/${done.body.id}/toggle`);

  const res = await request(app).get("/tasks?status=open");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(
    res.body.map((t: { id: number }) => t.id),
    [open.body.id],
  );
  assert.ok(res.body.every((t: { done: boolean }) => t.done === false));
  assert.ok(!res.body.some((t: { id: number }) => t.id === done.body.id));
});

test("GET /tasks without status returns all tasks", async () => {
  await request(app).post("/tasks").send({ title: "One" });
  await request(app).post("/tasks").send({ title: "Two" });

  const res = await request(app).get("/tasks");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 2);
});

// --- Seeded bugs: these two tests FAIL on purpose. Forge should fix the code. ---

test("POST /tasks rejects an empty title with 400", async () => {
  const res = await request(app).post("/tasks").send({ title: "   " });
  assert.strictEqual(res.status, 400);
});

test("DELETE on a missing task returns 404", async () => {
  const res = await request(app).delete("/tasks/999");
  assert.strictEqual(res.status, 404);
});
