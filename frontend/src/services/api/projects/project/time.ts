import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';
import { ProjectTaskService } from './tasks';
import { Project, Task, TaskAssignment, TaskComment, TimeTracking, ProjectFilters, TaskFilters } from './types';

export class ProjectTimeService extends ProjectTaskService {
  static async getTaskTimeTracking(taskId: string, profile?: any, userId?: string | null): Promise<TimeTracking[]> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    const timeEntries = await selectRecords('task_time_tracking', {
      where: { task_id: taskId, agency_id: agencyId },
      orderBy: 'date DESC'
    });

    const userIds = [...new Set(timeEntries.map((t: any) => t.user_id))];
    const users = userIds.length > 0 ? await selectRecords('profiles', {
      where: { agency_id: agencyId, user_id: { operator: 'in', value: userIds } }
    }) : [];

    const userMap = new Map<string, any>(users.map((u: any) => [u.user_id, u]));

    return timeEntries.map((entry: any) => ({
      ...entry,
      user: userMap.get(entry.user_id) ? {
        id: userMap.get(entry.user_id).user_id,
        full_name: userMap.get(entry.user_id).full_name
      } : undefined
    }));
  }

  static async logTime(taskId: string, hours: number, date: string, description: string | null, profile?: any, userId?: string | null): Promise<TimeTracking> {
    const agencyId = await this.getAgencyId(profile, userId);
    
    // Calculate start_time and end_time based on hours
    const now = new Date();
    const startTime = new Date(now);
    const endTime = new Date(now.getTime() + (hours * 60 * 60 * 1000)); // Add hours in milliseconds
    const durationMinutes = Math.round(hours * 60);
    
    const timeEntry = await insertRecord('task_time_tracking', {
      task_id: taskId,
      user_id: userId!,
      date,
      hours_logged: hours,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      description: description || null,
      billable: true,
      agency_id: agencyId,
    }, userId, agencyId);
    
    // Update task actual_hours
    const task = await this.getTask(taskId, profile, userId);
    if (task) {
      const totalHours = await this.getTaskTimeTracking(taskId, profile, userId).then(entries =>
        entries.reduce((sum, e) => sum + Number(e.hours_logged), 0)
      );
      await this.updateTask(taskId, { actual_hours: totalHours }, profile, userId);
    }
    
    return timeEntry as TimeTracking;
  }

  /**
   * Integration Methods - Enhanced project fetching with related data
   */

  /**
   * Get project with full client details
   */
}
