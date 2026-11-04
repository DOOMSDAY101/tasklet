import type { Task } from "./types";

// In-memory task store. Resets on restart. Good enough for the demo.
let tasks: Task[] = [];
let nextId = 1;

export function reset(): void {
  tasks = [];
  nextId = 1;
}

export function all(status?: "done" | "open"): Task[] {
  if (status === "done") return tasks.filter((t) => t.done);
  if (status === "open") return tasks.filter((t) => !t.done);
  return tasks;
}

export function find(id: number): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function add(title: string): Task {
  const task: Task = { id: nextId++, title, done: false };
  tasks.push(task);
  return task;
}

export function toggle(id: number): Task | null {
  const task = find(id);
  if (!task) return null;
  task.done = !task.done;
  return task;
}

export function remove(id: number): void {
  tasks = tasks.filter((t) => t.id !== id);
}
