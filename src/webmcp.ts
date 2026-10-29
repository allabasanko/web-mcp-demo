import type { Task, TaskInput, TaskStatus } from './types';
import { isStatus } from './storage';

type WebMcpRegistry = {
  registerTool: (tool: { name: string; description: string; inputSchema: object; execute: (input: unknown) => unknown | Promise<unknown> }, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

type TaskActions = {
  getTasks: () => Task[];
  create: (input: TaskInput) => Task;
  update: (id: string, changes: Partial<TaskInput>) => Task | undefined;
  remove: (id: string) => boolean;
  move: (id: string, status: TaskStatus) => Task | undefined;
};

export function registerWebMcpTools(actions: TaskActions): (() => void) | undefined {
  const registry = (document as Document & { modelContext?: WebMcpRegistry }).modelContext;
  if (!registry || typeof registry.registerTool !== 'function') return undefined;
  const controller = new AbortController();
  const objectSchema = { type: 'object', additionalProperties: false };

  const register = (name: string, description: string, properties: object, required: string[], execute: (input: unknown) => unknown) => {
    void Promise.resolve(registry.registerTool({ name, description, inputSchema: { ...objectSchema, properties, required }, execute }, { signal: controller.signal })).catch(() => undefined);
  };

  register('list_tasks', 'List tasks with optional text and status filters.', { query: { type: 'string', description: 'Text to search in title and body.' }, status: { type: 'string', enum: ['TO DO', 'IN PROGRESS', 'DONE'] } }, [], (input) => {
    const args = asRecord(input);
    const query = typeof args.query === 'string' ? args.query.toLowerCase() : '';
    const status = args.status === undefined || isStatus(args.status) ? args.status : undefined;
    return { tasks: actions.getTasks().filter((task) => (!status || task.status === status) && (!query || `${task.title} ${task.body}`.toLowerCase().includes(query))) };
  });
  register('create_task', 'Create a task on the board.', { title: { type: 'string', description: 'Short task title.' }, body: { type: 'string', description: 'Task details.' }, status: { type: 'string', enum: ['TO DO', 'IN PROGRESS', 'DONE'] } }, ['title'], (input) => {
    const args = asRecord(input);
    if (typeof args.title !== 'string' || !args.title.trim()) throw new Error('title is required');
    const task = actions.create({ title: args.title.trim(), body: typeof args.body === 'string' ? args.body.trim() : '', status: isStatus(args.status) ? args.status : 'TO DO' });
    return { task };
  });
  register('update_task', 'Update the title, details, or status of an existing task.', { id: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' }, status: { type: 'string', enum: ['TO DO', 'IN PROGRESS', 'DONE'] } }, ['id'], (input) => {
    const args = asRecord(input);
    const task = actions.update(String(args.id), { ...(typeof args.title === 'string' ? { title: args.title.trim() } : {}), ...(typeof args.body === 'string' ? { body: args.body.trim() } : {}), ...(isStatus(args.status) ? { status: args.status } : {}) });
    if (!task) throw new Error('task not found');
    return { task };
  });
  register('delete_task', 'Delete an existing task from the board.', { id: { type: 'string' } }, ['id'], (input) => {
    const id = String(asRecord(input).id);
    if (!actions.remove(id)) throw new Error('task not found');
    return { deleted: id };
  });
  register('move_task', 'Move an existing task to a different board column.', { id: { type: 'string' }, status: { type: 'string', enum: ['TO DO', 'IN PROGRESS', 'DONE'] } }, ['id', 'status'], (input) => {
    const args = asRecord(input);
    if (!isStatus(args.status)) throw new Error('valid status is required');
    const task = actions.move(String(args.id), args.status);
    if (!task) throw new Error('task not found');
    return { task };
  });

  return () => controller.abort();
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? input as Record<string, unknown> : {};
}
