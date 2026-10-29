import type { Task, TaskInput, TaskStatus } from './types';
import { STATUSES } from './types';

const STORAGE_KEY = 'web-mcp-demo.tasks.v1';

const seedTasks: Task[] = [
  { id: 'task-1', title: 'Map the first user flow', body: 'Sketch the smallest useful path through the demo.', status: 'TO DO', createdAt: '2026-10-01T09:00:00.000Z', updatedAt: '2026-10-01T09:00:00.000Z' },
  { id: 'task-2', title: 'Add WebMCP actions', body: 'Expose task actions so an agent can work with the board.', status: 'IN PROGRESS', createdAt: '2026-10-02T09:00:00.000Z', updatedAt: '2026-10-02T09:00:00.000Z' },
  { id: 'task-3', title: 'Polish the empty states', body: 'Make every screen helpful when there is nothing to show.', status: 'DONE', createdAt: '2026-10-03T09:00:00.000Z', updatedAt: '2026-10-03T09:00:00.000Z' },
];

export function readTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seedTasks;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return seedTasks;
    return parsed.filter(isTask);
  } catch {
    return seedTasks;
  }
}

export function writeTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTask(input: TaskInput): Task {
  const now = new Date().toISOString();
  return { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
}

export function updateTask(task: Task, changes: Partial<TaskInput>): Task {
  return { ...task, ...changes, updatedAt: new Date().toISOString() };
}

export function isStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && STATUSES.includes(value as TaskStatus);
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && typeof item.title === 'string' && typeof item.body === 'string' && isStatus(item.status) && typeof item.createdAt === 'string' && typeof item.updatedAt === 'string';
}
