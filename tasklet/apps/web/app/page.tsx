"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/tasks");
    setTasks((await res.json()) as Task[]);
  }

  useEffect(() => {
    load();
  }, []);

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

      {tasks.length === 0 ? (
        <p style={{ color: "#6b6b66" }}>No tasks yet. Add your first one above.</p>
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
    </main>
  );
}
