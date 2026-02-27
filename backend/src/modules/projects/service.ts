
import { FastifyInstance } from 'fastify';
import { ProjectManagementService } from './services/project-management.service.js';
import { ProjectDetailsService } from './services/project-details.service.js';
import { CreateProjectInput, UpdateProjectInput, ProjectsQueryInput } from './schemas.js';

export class ProjectService {
    private management: ProjectManagementService;
    private details: ProjectDetailsService;

    constructor(private readonly app: FastifyInstance) {
        this.management = new ProjectManagementService(app);
        this.details = new ProjectDetailsService(app);
    }

    async getProjects(agencyId: string, params?: ProjectsQueryInput) {
        return this.management.getProjects(agencyId, params);
    }

    async getProject(agencyId: string, id: string) {
        return this.management.getProject(agencyId, id);
    }

    async getProjectDetails(agencyId: string, id: string) {
        return this.details.getProjectDetails(agencyId, id);
    }

    async createProject(agencyId: string, input: CreateProjectInput, userId: string) {
        return this.management.createProject(agencyId, input, userId);
    }

    async updateProject(agencyId: string, id: string, input: UpdateProjectInput) {
        return this.management.updateProject(agencyId, id, input);
    }

    async deleteProject(agencyId: string, id: string) {
        return this.management.deleteProject(agencyId, id);
    }
}
