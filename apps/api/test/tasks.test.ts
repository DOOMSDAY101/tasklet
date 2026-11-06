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

test("PATCH /tasks/:id renames a task", async () => {
  const created = await request(app).post("/tasks").send({ title: "Old title" });
  const res = await request(app)
    .patch(`/tasks/${created.body.id}`)
    .send({ title: "New title" });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, created.body.id);
  assert.strictEqual(res.body.title, "New title");
  assert.strictEqual(res.body.done, false);

  const list = await request(app).get("/tasks");
  assert.strictEqual(list.body[0].title, "New title");
});

test("PATCH /tasks/:id on missing task returns 404", async () => {
  const res = await request(app).patch("/tasks/999").send({ title: "New title" });
  assert.strictEqual(res.status, 404);
});

test("PATCH /tasks/:id rejects an empty title with 400", async () => {
  const created = await request(app).post("/tasks").send({ title: "Old title" });
  const res = await request(app)
    .patch(`/tasks/${created.body.id}`)
    .send({ title: "   " });
  assert.strictEqual(res.status, 400);
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

test("GET /tasks?limit= returns at most limit tasks", async () => {
  await request(app).post("/tasks").send({ title: "One" });
  await request(app).post("/tasks").send({ title: "Two" });
  await request(app).post("/tasks").send({ title: "Three" });

  const res = await request(app).get("/tasks?limit=2");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(
    res.body.map((t: { title: string }) => t.title),
    ["One", "Two"],
  );
});

test("GET /tasks?offset= skips tasks", async () => {
  await request(app).post("/tasks").send({ title: "One" });
  await request(app).post("/tasks").send({ title: "Two" });
  await request(app).post("/tasks").send({ title: "Three" });

  const res = await request(app).get("/tasks?offset=1");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(
    res.body.map((t: { title: string }) => t.title),
    ["Two", "Three"],
  );
});

test("GET /tasks combines limit and offset with status filter", async () => {
  const a = await request(app).post("/tasks").send({ title: "One" });
  await request(app).post("/tasks").send({ title: "Two" });
  await request(app).post("/tasks").send({ title: "Three" });
  const done = await request(app).post("/tasks").send({ title: "Done" });
  await request(app).patch(`/tasks/${done.body.id}/toggle`);

  const res = await request(app).get("/tasks?status=open&limit=1&offset=1");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(
    res.body.map((t: { id: number }) => t.id),
    [a.body.id + 1],
  );
});

test("GET /tasks with offset past the end returns an empty list", async () => {
  await request(app).post("/tasks").send({ title: "One" });

  const res = await request(app).get("/tasks?offset=10");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, []);
});

test("GET /tasks rejects a non-numeric limit with 400", async () => {
  const res = await request(app).get("/tasks?limit=abc");
  assert.strictEqual(res.status, 400);
});

test("GET /tasks rejects a negative offset with 400", async () => {
  const res = await request(app).get("/tasks?offset=-1");
  assert.strictEqual(res.status, 400);
});

test("GET /tasks with limit=0 returns an empty list", async () => {
  await request(app).post("/tasks").send({ title: "One" });

  const res = await request(app).get("/tasks?limit=0");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, []);
});

test("GET /tasks rejects an empty or whitespace limit with 400", async () => {
  const empty = await request(app).get("/tasks?limit=");
  assert.strictEqual(empty.status, 400);

  const whitespace = await request(app).get("/tasks?limit=%20");
  assert.strictEqual(whitespace.status, 400);
});

test("GET /tasks rejects a huge limit with 400", async () => {
  const res = await request(app).get("/tasks?limit=999999999999999999999");
  assert.strictEqual(res.status, 400);
});

test("GET /tasks rejects a non-numeric offset with 400", async () => {
  const res = await request(app).get("/tasks?offset=abc");
  assert.strictEqual(res.status, 400);
});

test("GET /tasks rejects a negative limit with 400", async () => {
  const res = await request(app).get("/tasks?limit=-1");
  assert.strictEqual(res.status, 400);
});

// --- Seeded bug regressions ---

test("POST /tasks rejects an empty title with 400", async () => {
  const res = await request(app).post("/tasks").send({ title: "   " });
  assert.strictEqual(res.status, 400);
});

test("POST /tasks rejects a missing or non-string title with 400", async () => {
  const missing = await request(app).post("/tasks").send({});
  assert.strictEqual(missing.status, 400);

  const wrongType = await request(app).post("/tasks").send({ title: 42 });
  assert.strictEqual(wrongType.status, 400);
});

test("DELETE on a missing task returns 404", async () => {
  const res = await request(app).delete("/tasks/999");
  assert.strictEqual(res.status, 404);
});

test("DELETE /tasks/:id removes the task", async () => {
  const created = await request(app).post("/tasks").send({ title: "Delete me" });
  const res = await request(app).delete(`/tasks/${created.body.id}`);
  assert.strictEqual(res.status, 204);

  const list = await request(app).get("/tasks");
  assert.strictEqual(list.body.length, 0);
});
