import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';
import { Project, Task, TaskAssignment, TaskComment, TimeTracking, ProjectFilters, TaskFilters } from './types';

import { BaseProjectService } from './_base';

export class ProjectTaskService extends BaseProjectService {
  static async getTasks(filters?: TaskFilters, profile?: unknown, userId?: string | null): Promise<Task[]> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const where: any = { agency_id: agencyId };
    const queryFilters: any[] = [];

    if (filters?.project_id) {
      where.project_id = filters.project_id;
    }
    if (filters?.assignee_id) {
      where.assignee_id = filters.assignee_id;
    }
    if (filters?.status && filters.status.length > 0) {
      queryFilters.push({ column: 'status', operator: 'in', value: filters.status });
    }
    if (filters?.priority && filters.priority.length > 0) {
      queryFilters.push({ column: 'priority', operator: 'in', value: filters.priority });
    }
    if (filters?.search) {
      queryFilters.push({
        column: '__or__',
        operator: 'or',
        value: `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      });
    }

    const tasks = await selectRecords('tasks', {
      where,
      filters: queryFilters.length > 0 ? queryFilters : undefined,
      orderBy: 'created_at DESC'
    });

    // Fetch related data
    const projectIds = [...new Set(tasks.map((t: any) => t.project_id).filter(Boolean))];
    const assigneeIds = [...new Set(tasks.map((t: any) => t.assignee_id).filter(Boolean))].filter(Boolean);

    const projects = projectIds.length > 0 ? await selectRecords('projects', {
      where: { agency_id: agencyId, id: { operator: 'in', value: projectIds } }
    }) : [];

    const assignees = assigneeIds.length > 0 ? await selectRecords('profiles', {
      where: { agency_id: agencyId, user_id: { operator: 'in', value: assigneeIds } }
    }) : [];

    const projectMap = new Map<string, any>(projects.map((p: any) => [p.id, p]));
    const assigneeMap = new Map<string, any>(assignees.map((a: any) => [a.user_id, a]));

    return tasks.map((task: any) => ({
      ...task,
      tags: Array.isArray(task.tags) ? task.tags : 
            typeof task.tags === 'string' ? JSON.parse(task.tags || '[]') : [],
      attachments: Array.isArray(task.attachments) ? task.attachments : 
                   typeof task.attachments === 'string' ? JSON.parse(task.attachments || '[]') : [],
      checklist: Array.isArray(task.checklist) ? task.checklist : 
                 typeof task.checklist === 'string' ? JSON.parse(task.checklist || '[]') : [],
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : 
                    typeof task.dependencies === 'string' ? JSON.parse(task.dependencies || '[]') : [],
      custom_fields: typeof task.custom_fields === 'object' ? task.custom_fields : 
                     typeof task.custom_fields === 'string' ? JSON.parse(task.custom_fields || '{}') : {},
      project: task.project_id ? projectMap.get(task.project_id) : undefined,
      assignee: task.assignee_id ? assigneeMap.get(task.assignee_id) : undefined,
    }));
  }

  static async getTask(id: string, profile?: unknown, userId?: string | null): Promise<Task | null> {
    const agencyId = await this.getAgencyId(profile, userId);
    const task = await selectOne('tasks', { id, agency_id: agencyId });
    
    if (!task) return null;

    // Fetch assignments
    const assignments = await selectRecords('task_assignments', {
      where: { task_id: id, agency_id: agencyId }
    });

    const assigneeIds = [...new Set([
      task.assignee_id,
      ...assignments.map((a: any) => a.user_id)
    ].filter(Boolean))].filter(Boolean);

    const assignees = assigneeIds.length > 0 ? await selectRecords('profiles', {
      where: { agency_id: agencyId, user_id: { operator: 'in', value: assigneeIds } }
    }) : [];

    const assigneeMap = new Map<string, any>(assignees.map((a: any) => [a.user_id, a]));

    // Fetch project if task has project_id
    let project = null;
    if (task.project_id) {
      project = await selectOne('projects', { id: task.project_id, agency_id: agencyId });
    }

    return {
      ...task,
      tags: Array.isArray(task.tags) ? task.tags : 
            typeof task.tags === 'string' ? JSON.parse(task.tags || '[]') : [],
      attachments: Array.isArray(task.attachments) ? task.attachments : 
                   typeof task.attachments === 'string' ? JSON.parse(task.attachments || '[]') : [],
      checklist: Array.isArray(task.checklist) ? task.checklist : 
                 typeof task.checklist === 'string' ? JSON.parse(task.checklist || '[]') : [],
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : 
                    typeof task.dependencies === 'string' ? JSON.parse(task.dependencies || '[]') : [],
      custom_fields: typeof task.custom_fields === 'object' ? task.custom_fields : 
                     typeof task.custom_fields === 'string' ? JSON.parse(task.custom_fields || '{}') : {},
      assignee: task.assignee_id ? assigneeMap.get(task.assignee_id) : undefined,
      project: project ? {
        id: project.id,
        name: project.name
      } : undefined,
      assignments: assignments.map((a: any) => ({
        id: a.id,
        user_id: a.user_id,
        user: assigneeMap.get(a.user_id) ? {
          id: a.user_id,
          full_name: assigneeMap.get(a.user_id).full_name
        } : undefined
      })).filter((a: any) => a.user)
    };
  }

  static async createTask(data: Partial<Task>, profile?: unknown, userId?: string | null): Promise<Task> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const taskData: any = {
      title: data.title,
      description: data.description || null,
      task_type: data.task_type || null,
      project_id: data.project_id || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      due_date: data.due_date || null,
      start_date: data.start_date || null,
      estimated_hours: data.estimated_hours || null,
      actual_hours: data.actual_hours || 0,
      progress: data.progress || 0,
      assignee_id: data.assignee_id || null,
      tags: JSON.stringify(data.tags || []),
      attachments: JSON.stringify(data.attachments || []),
      checklist: JSON.stringify(data.checklist || []),
      dependencies: JSON.stringify(data.dependencies || []),
      custom_fields: JSON.stringify(data.custom_fields || {}),
      agency_id: agencyId,
      created_by: userId || null,
    };

    const task = await insertRecord('tasks', taskData, userId, agencyId);
    
    // Create task assignment if assignee_id is provided
    if (data.assignee_id && userId) {
      try {
        await this.assignTask(task.id, data.assignee_id, userId, profile);
      } catch (error) {
        console.warn('Failed to create initial task assignment:', error);
      }
    }
    
    return this.getTask(task.id, profile, userId) as Promise<Task>;
  }

  static async updateTask(id: string, data: Partial<Task>, profile?: unknown, userId?: string | null): Promise<Task> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.task_type !== undefined) updateData.task_type = data.task_type;
    if (data.project_id !== undefined) updateData.project_id = data.project_id;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed' && !data.completed_at) {
        updateData.completed_at = new Date().toISOString();
      } else if (data.status !== 'completed') {
        updateData.completed_at = null;
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.start_date !== undefined) updateData.start_date = data.start_date;
    if (data.estimated_hours !== undefined) updateData.estimated_hours = data.estimated_hours;
    if (data.actual_hours !== undefined) updateData.actual_hours = data.actual_hours;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.assignee_id !== undefined) {
      updateData.assignee_id = data.assignee_id;
      
      // Ensure task assignment exists if assignee_id is set
      if (data.assignee_id && userId) {
        try {
          const existingTask = await this.getTask(id, profile, userId);
          const isAssigned = existingTask?.assignments?.some(a => a.user_id === data.assignee_id);
          if (!isAssigned) {
            await this.assignTask(id, data.assignee_id, userId, profile);
          }
        } catch (error) {
          console.warn('Failed to update task assignment:', error);
        }
      }
    }
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.attachments !== undefined) updateData.attachments = JSON.stringify(data.attachments);
    if (data.checklist !== undefined) updateData.checklist = JSON.stringify(data.checklist);
    if (data.dependencies !== undefined) updateData.dependencies = JSON.stringify(data.dependencies);
    if (data.custom_fields !== undefined) updateData.custom_fields = JSON.stringify(data.custom_fields);

    await updateRecord('tasks', updateData, { id, agency_id: agencyId }, userId);
    return this.getTask(id, profile, userId) as Promise<Task>;
  }

  static async deleteTask(id: string, profile?: unknown, userId?: string | null): Promise<void> {
    const agencyId = await this.getAgencyId(profile, userId);
    await deleteRecord('tasks', { id, agency_id: agencyId }, userId);
  }

  /**
   * Task Assignments
   */
  static async assignTask(taskId: string, userId: string, assignedBy: string, profile?: unknown): Promise<TaskAssignment> {
    const agencyId = await this.getAgencyId(profile, assignedBy);
    
    // Check if assignment already exists
    const existing = await selectOne('task_assignments', {
      task_id: taskId,
      user_id: userId,
      agency_id: agencyId
    });
    
    if (existing) {
      // Return existing assignment instead of creating duplicate
      return existing as TaskAssignment;
    }
    
    const assignment = await insertRecord('task_assignments', {
      task_id: taskId,
      user_id: userId,
      assigned_by: assignedBy,
      agency_id: agencyId,
    }, assignedBy, agencyId);
    
    // Create notification for the assigned user
    try {
      // Get task details directly from database (more reliable than getTask which might fail on project fetch)
      const task = await selectOne('tasks', {
        id: taskId,
        agency_id: agencyId
      });
      
      if (!task) {
        console.warn('Task not found for notification creation:', taskId);
        return assignment as TaskAssignment;
      }
      
      // Get assigner's profile for the notification message
      let assignerName = 'Someone';
      try {
        const assignerProfile = await selectOne('profiles', {
          user_id: assignedBy,
          agency_id: agencyId
        });
        if (assignerProfile) {
          assignerName = (assignerProfile as any).full_name || 'Someone';
        }
      } catch (error) {
        console.warn('Failed to fetch assigner profile for notification:', error);
      }
      
      const taskTitle = (task as any).title || 'Task';
      
      // Get project name if project_id exists
      let projectName = '';
      if ((task as any).project_id) {
        try {
          const project = await selectOne('projects', {
            id: (task as any).project_id,
            agency_id: agencyId
          });
          if (project) {
            projectName = ` in ${(project as any).name}`;
          }
        } catch (error) {
          // Project fetch failed, but continue without project name
          console.warn('Failed to fetch project for notification:', error);
        }
      }
      
      // Determine priority based on task priority
      let notificationPriority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
      const taskPriority = (task as any).priority;
      if (taskPriority === 'critical' || taskPriority === 'urgent') {
        notificationPriority = 'urgent';
      } else if (taskPriority === 'high') {
        notificationPriority = 'high';
      } else if (taskPriority === 'low') {
        notificationPriority = 'low';
      }
      
      // Create notification message
      const notificationMessage = `${assignerName} assigned you a task: "${taskTitle}"${projectName}.`;
      
      // Create action URL to navigate to the task
      const actionUrl = `/project-management?task=${taskId}`;
      
      // Create the notification
      await insertRecord('notifications', {
        user_id: userId,
        type: 'in_app',
        category: 'update',
        title: 'New Task Assignment',
        message: notificationMessage,
        priority: notificationPriority,
        action_url: actionUrl,
        metadata: {
          task_id: taskId,
          assigned_by: assignedBy,
          task_title: taskTitle,
          project_id: (task as any).project_id || null,
          project_name: projectName ? projectName.replace(' in ', '') : null,
        },
      }, assignedBy, agencyId);
    } catch (error) {
      // Log error but don't fail the assignment if notification creation fails
      console.error('Failed to create notification for task assignment:', error);
    }
    
    return assignment as TaskAssignment;
  }

  static async unassignTask(taskId: string, userId: string, profile?: unknown, currentUserId?: string | null): Promise<void> {
    const agencyId = await this.getAgencyId(profile, currentUserId);
    await deleteRecord('task_assignments', { task_id: taskId, user_id: userId, agency_id: agencyId }, currentUserId);
  }

  /**
   * Task Comments
   */
  static async getTaskComments(taskId: string, profile?: unknown, userId?: string | null): Promise<TaskComment[]> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const comments = await selectRecords('task_comments', {
      where: { task_id: taskId, agency_id: agencyId },
      orderBy: 'created_at ASC'
    });

    const userIds = [...new Set(comments.map((c: any) => c.user_id))];
    const users = userIds.length > 0 ? await selectRecords('profiles', {
      where: { agency_id: agencyId, user_id: { operator: 'in', value: userIds } }
    }) : [];

    const userMap = new Map<string, any>(users.map((u: any) => [u.user_id, u]));

    return comments.map((comment: any) => ({
      ...comment,
      attachments: Array.isArray(comment.attachments) ? comment.attachments : 
                   typeof comment.attachments === 'string' ? JSON.parse(comment.attachments || '[]') : [],
      mentions: Array.isArray(comment.mentions) ? comment.mentions : 
                typeof comment.mentions === 'string' ? JSON.parse(comment.mentions || '[]') : [],
      user: userMap.get(comment.user_id) ? {
        id: userMap.get(comment.user_id).user_id,
        full_name: userMap.get(comment.user_id).full_name,
        avatar_url: userMap.get(comment.user_id).avatar_url
      } : undefined
    }));
  }

  static async createTaskComment(taskId: string, comment: string, profile?: unknown, userId?: string | null): Promise<TaskComment> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const commentData = await insertRecord('task_comments', {
      task_id: taskId,
      user_id: userId!,
      comment,
      attachments: JSON.stringify([]),
      mentions: JSON.stringify([]),
      agency_id: agencyId,
    }, userId, agencyId);
    
    return this.getTaskComments(taskId, profile, userId).then(comments => 
      comments.find(c => c.id === commentData.id)!
    );
  }

  /**
   * Time Tracking
   */
}
