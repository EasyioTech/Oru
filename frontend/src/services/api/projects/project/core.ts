import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';
import { BaseProjectService } from './_base';
import { Project, Task, TaskAssignment, TaskComment, TimeTracking, ProjectFilters, TaskFilters } from './types';

export class ProjectCoreService extends BaseProjectService {
  static async getProjects(filters?: ProjectFilters, profile?: unknown, userId?: string | null): Promise<Project[]> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const where: any = { agency_id: agencyId };
    const queryFilters: any[] = [];

    if (filters?.status && filters.status.length > 0) {
      queryFilters.push({ column: 'status', operator: 'in', value: filters.status });
    }
    if (filters?.client_id) {
      where.client_id = filters.client_id;
    }
    if (filters?.project_manager_id) {
      where.project_manager_id = filters.project_manager_id;
    }
    if (filters?.priority && filters.priority.length > 0) {
      queryFilters.push({ column: 'priority', operator: 'in', value: filters.priority });
    }
    if (filters?.search) {
      queryFilters.push({
        column: '__or__',
        operator: 'or',
        value: `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,project_code.ilike.%${filters.search}%`
      });
    }

    const projects = await selectRecords('projects', {
      where,
      filters: queryFilters.length > 0 ? queryFilters : undefined,
      orderBy: 'created_at DESC'
    });

    // Fetch related data
    const clientIds = [...new Set(projects.map((p: any) => p.client_id).filter(Boolean))];
    const managerIds = [...new Set([
      ...projects.map((p: any) => p.project_manager_id).filter(Boolean),
      ...projects.map((p: any) => p.account_manager_id).filter(Boolean)
    ])].filter(Boolean);

    const clients = clientIds.length > 0 ? await selectRecords('clients', {
      where: { agency_id: agencyId, id: { operator: 'in', value: clientIds } }
    }) : [];

    const managers = managerIds.length > 0 ? await selectRecords('profiles', {
      where: { agency_id: agencyId, user_id: { operator: 'in', value: managerIds } }
    }) : [];

    const clientMap = new Map<string, any>(clients.map((c: any) => [c.id, c]));
    const managerMap = new Map<string, any>(managers.map((m: any) => [m.user_id, m]));

    return projects.map((project: any) => ({
      ...project,
      assigned_team: Array.isArray(project.assigned_team) ? project.assigned_team : 
                    typeof project.assigned_team === 'string' ? JSON.parse(project.assigned_team || '[]') : [],
      departments: Array.isArray(project.departments) ? project.departments : 
                   typeof project.departments === 'string' ? JSON.parse(project.departments || '[]') : [],
      tags: Array.isArray(project.tags) ? project.tags : 
            typeof project.tags === 'string' ? JSON.parse(project.tags || '[]') : [],
      categories: Array.isArray(project.categories) ? project.categories : 
                  typeof project.categories === 'string' ? JSON.parse(project.categories || '[]') : [],
      custom_fields: typeof project.custom_fields === 'object' ? project.custom_fields : 
                     typeof project.custom_fields === 'string' ? JSON.parse(project.custom_fields || '{}') : {},
      client: project.client_id ? clientMap.get(project.client_id) : undefined,
      project_manager: project.project_manager_id ? managerMap.get(project.project_manager_id) : undefined,
      account_manager: project.account_manager_id ? managerMap.get(project.account_manager_id) : undefined,
    }));
  }

  static async getProject(id: string, profile?: unknown, userId?: string | null): Promise<Project | null> {
    const agencyId = await this.getAgencyId(profile, userId);
    const project = await selectOne('projects', { id, agency_id: agencyId });
    
    if (!project) return null;

    // Fetch related data
    const [client, projectManager, accountManager] = await Promise.all([
      project.client_id ? selectOne('clients', { id: project.client_id, agency_id: agencyId }) : null,
      project.project_manager_id ? selectOne('profiles', { user_id: project.project_manager_id, agency_id: agencyId }) : null,
      project.account_manager_id ? selectOne('profiles', { user_id: project.account_manager_id, agency_id: agencyId }) : null,
    ]);

    return {
      ...project,
      assigned_team: Array.isArray(project.assigned_team) ? project.assigned_team : 
                    typeof project.assigned_team === 'string' ? JSON.parse(project.assigned_team || '[]') : [],
      departments: Array.isArray(project.departments) ? project.departments : 
                   typeof project.departments === 'string' ? JSON.parse(project.departments || '[]') : [],
      tags: Array.isArray(project.tags) ? project.tags : 
            typeof project.tags === 'string' ? JSON.parse(project.tags || '[]') : [],
      categories: Array.isArray(project.categories) ? project.categories : 
                  typeof project.categories === 'string' ? JSON.parse(project.categories || '[]') : [],
      custom_fields: typeof project.custom_fields === 'object' ? project.custom_fields : 
                     typeof project.custom_fields === 'string' ? JSON.parse(project.custom_fields || '{}') : {},
      client: client || undefined,
      project_manager: projectManager ? { id: projectManager.user_id, full_name: projectManager.full_name } : undefined,
      account_manager: accountManager ? { id: accountManager.user_id, full_name: accountManager.full_name } : undefined,
    };
  }

  static async createProject(data: Partial<Project>, profile?: unknown, userId?: string | null): Promise<Project> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const projectData: any = {
      name: data.name,
      description: data.description || null,
      project_code: data.project_code || await this.generateProjectCode(agencyId),
      project_type: data.project_type || null,
      status: data.status || 'planning',
      priority: data.priority || 'medium',
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      deadline: data.deadline || null,
      budget: data.budget || null,
      actual_cost: data.actual_cost || 0,
      allocated_budget: data.allocated_budget || null,
      cost_center: data.cost_center || null,
      currency: data.currency || 'INR',
      client_id: data.client_id || null,
      project_manager_id: data.project_manager_id || null,
      account_manager_id: data.account_manager_id || null,
      assigned_team: JSON.stringify(data.assigned_team || []),
      departments: JSON.stringify(data.departments || []),
      tags: JSON.stringify(data.tags || []),
      categories: JSON.stringify(data.categories || []),
      custom_fields: JSON.stringify(data.custom_fields || {}),
      progress: data.progress || 0,
      agency_id: agencyId,
      created_by: userId || null,
    };

    const project = await insertRecord('projects', projectData, userId, agencyId);
    return this.getProject(project.id, profile, userId) as Promise<Project>;
  }

  static async updateProject(id: string, data: Partial<Project>, profile?: unknown, userId?: string | null): Promise<Project> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.project_code !== undefined) updateData.project_code = data.project_code;
    if (data.project_type !== undefined) updateData.project_type = data.project_type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.start_date !== undefined) updateData.start_date = data.start_date;
    if (data.end_date !== undefined) updateData.end_date = data.end_date;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.actual_cost !== undefined) updateData.actual_cost = data.actual_cost;
    if (data.allocated_budget !== undefined) updateData.allocated_budget = data.allocated_budget;
    if (data.cost_center !== undefined) updateData.cost_center = data.cost_center;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.client_id !== undefined) updateData.client_id = data.client_id;
    if (data.project_manager_id !== undefined) updateData.project_manager_id = data.project_manager_id;
    if (data.account_manager_id !== undefined) updateData.account_manager_id = data.account_manager_id;
    if (data.assigned_team !== undefined) updateData.assigned_team = JSON.stringify(data.assigned_team);
    if (data.departments !== undefined) updateData.departments = JSON.stringify(data.departments);
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.categories !== undefined) updateData.categories = JSON.stringify(data.categories);
    if (data.custom_fields !== undefined) updateData.custom_fields = JSON.stringify(data.custom_fields);
    if (data.progress !== undefined) updateData.progress = data.progress;

    await updateRecord('projects', updateData, { id, agency_id: agencyId }, userId);
    return this.getProject(id, profile, userId) as Promise<Project>;
  }

  static async deleteProject(id: string, profile?: unknown, userId?: string | null): Promise<void> {
    const agencyId = await this.getAgencyId(profile, userId);
    await deleteRecord('projects', { id, agency_id: agencyId }, userId);
  }

  /**
   * Tasks CRUD
   */
}
