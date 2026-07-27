import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { projects, projectTasks } from './schema.js';

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
export type Task = InferSelectModel<typeof projectTasks>;
export type NewTask = InferInsertModel<typeof projectTasks>;

export interface ProjectFilters {
    status?: string;
    clientId?: string;
    search?: string;
}
