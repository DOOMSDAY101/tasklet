"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

type StatusFilter = "all" | "open" | "done";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Done", value: "done" },
];

const PAGE_SIZE = 5;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  async function load(filter: StatusFilter = status, pageIndex: number = page) {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    params.set("limit", String(PAGE_SIZE + 1));
    params.set("offset", String(pageIndex * PAGE_SIZE));
    const res = await fetch(`/api/tasks?${params.toString()}`);
    const rows = (await res.json()) as Task[];
    setHasNextPage(rows.length > PAGE_SIZE);
    setTasks(rows.slice(0, PAGE_SIZE));
  }

  useEffect(() => {
    load(status, page);
  }, [status, page]);

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      setError("Could not add the task.");
      return;
    }
    setTitle("");
    load();
  }

  async function toggle(id: number) {
    await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (tasks.length === 1 && page > 0) {
      setPage(page - 1);
      return;
    }
    load();
  }

  return (
    <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Tasklet</h1>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="Task title"
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: "8px 16px", fontSize: 16 }}>
          Add task
        </button>
      </form>

      {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value);
              setPage(0);
            }}
            aria-pressed={status === f.value}
            style={{
              padding: "6px 14px",
              fontSize: 14,
              cursor: "pointer",
              background: status === f.value ? "#1c1c1a" : "transparent",
              color: status === f.value ? "#fff" : "#1c1c1a",
              border: "1px solid #1c1c1a",
              borderRadius: 999,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <p style={{ color: "#6b6b66" }}>
          {status === "all" ? "No tasks yet. Add your first one above." : `No ${status} tasks.`}
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 24 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} aria-label={`Mark ${t.title} done`} />
              <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
              <button onClick={() => remove(t.id)} aria-label={`Delete ${t.title}`}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {(tasks.length > 0 || page > 0) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginTop: 24,
          }}
        >
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
            style={{ padding: "6px 14px", fontSize: 14, cursor: page === 0 ? "default" : "pointer" }}
          >
            Previous
          </button>
          <span style={{ color: "#6b6b66", fontSize: 14 }}>Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage}
            aria-label="Next page"
            style={{
              padding: "6px 14px",
              fontSize: 14,
              cursor: hasNextPage ? "pointer" : "default",
            }}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
