export const STATUSES = ['TO DO', 'IN PROGRESS', 'DONE'] as const;
export type TaskStatus = (typeof STATUSES)[number];

export type Task = {
  id: string;
  title: string;
  body: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = Pick<Task, 'title' | 'body' | 'status'>;
