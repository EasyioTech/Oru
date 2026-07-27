import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, or, SQL } from 'drizzle-orm';
import { projects, projectTasks } from './schema.js';
import { ProjectFilters, NewProject, NewTask } from './types.js';
import { indexProjects, removeFromIndex } from '../../infrastructure/meilisearch/indexer.js';

export class ProjectService {
    constructor(
        private db: NodePgDatabase<any> | any,
        private agencyId: string
    ) { }

    // --- PROJECTS ---

    async getProjects(filters?: ProjectFilters) {
        const conditions: SQL[] = [eq(projects.agencyId, this.agencyId)];
        
        if (filters?.status && filters.status !== 'all') {
            conditions.push(eq(projects.status, filters.status));
        }
        
        if (filters?.clientId) {
            conditions.push(eq(projects.clientId, filters.clientId));
        }
        
        if (filters?.search) {
            conditions.push(or(
                ilike(projects.name, `%${filters.search}%`),
                ilike(projects.projectCode, `%${filters.search}%`)
            ) as SQL);
        }

        const data = await this.db.select().from(projects).where(and(...conditions));
        return data;
    }

    async getProject(id: string) {
        const [project] = await this.db.select().from(projects).where(and(eq(projects.id, id), eq(projects.agencyId, this.agencyId)));
        if (!project) throw new Error('Project not found');
        return project;
    }

    async createProject(data: NewProject) {
        const [project] = await this.db.insert(projects).values({ 
            ...data,
            agencyId: this.agencyId
        }).returning();
        Promise.resolve().then(() => indexProjects(this.agencyId, [project]).catch(() => {}));
        return project;
    }

    async updateProject(id: string, data: Partial<NewProject>) {
        const [project] = await this.db.update(projects)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(projects.id, id), eq(projects.agencyId, this.agencyId)))
            .returning();
        Promise.resolve().then(() => indexProjects(this.agencyId, [project]).catch(() => {}));
        return project;
    }

    async deleteProject(id: string) {
        await this.db.update(projects)
            .set({ deletedAt: new Date() })
            .where(and(eq(projects.id, id), eq(projects.agencyId, this.agencyId)));
        Promise.resolve().then(() => removeFromIndex('projects', id).catch(() => {}));
    }

    // --- TASKS ---

    async getTasks(projectId: string) {
        const data = await this.db.select().from(projectTasks).where(and(eq(projectTasks.projectId, projectId), eq(projectTasks.agencyId, this.agencyId)));
        return data;
    }

    async getTask(taskId: string) {
        const [task] = await this.db.select().from(projectTasks).where(and(eq(projectTasks.id, taskId), eq(projectTasks.agencyId, this.agencyId)));
        if (!task) throw new Error('Task not found');
        return task;
    }

    async createTask(projectId: string, data: NewTask) {
        const [task] = await this.db.insert(projectTasks).values({
            ...data,
            agencyId: this.agencyId,
            projectId
        }).returning();
        return task;
    }

    async updateTask(taskId: string, data: Partial<NewTask>) {
        const [task] = await this.db.update(projectTasks)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(projectTasks.id, taskId), eq(projectTasks.agencyId, this.agencyId)))
            .returning();
        return task;
    }

    async deleteTask(taskId: string) {
        await this.db.update(projectTasks)
            .set({ deletedAt: new Date() })
            .where(and(eq(projectTasks.id, taskId), eq(projectTasks.agencyId, this.agencyId)));
    }
}
