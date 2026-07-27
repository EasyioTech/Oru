import { ProjectCoreService } from './project/core';
import { ProjectExtendedService } from './project/extended';
import { ProjectTaskService } from './project/tasks';
import { ProjectTimeService } from './project/time';
export * from './project/types';

export class ProjectService {
  static getProjects = ProjectCoreService.getProjects.bind(ProjectCoreService);
  static getProject = ProjectCoreService.getProject.bind(ProjectCoreService);
  static createProject = ProjectCoreService.createProject.bind(ProjectCoreService);
  static updateProject = ProjectCoreService.updateProject.bind(ProjectCoreService);
  static deleteProject = ProjectCoreService.deleteProject.bind(ProjectCoreService);
  static getProjectWithClient = ProjectExtendedService.getProjectWithClient.bind(ProjectExtendedService);
  static getProjectWithFinancials = ProjectExtendedService.getProjectWithFinancials.bind(ProjectExtendedService);
  static getProjectsByClient = ProjectExtendedService.getProjectsByClient.bind(ProjectExtendedService);
  static getProjectsByEmployee = ProjectExtendedService.getProjectsByEmployee.bind(ProjectExtendedService);
  static getProjectWithTeam = ProjectExtendedService.getProjectWithTeam.bind(ProjectExtendedService);
  static getTasks = ProjectTaskService.getTasks.bind(ProjectTaskService);
  static getTask = ProjectTaskService.getTask.bind(ProjectTaskService);
  static createTask = ProjectTaskService.createTask.bind(ProjectTaskService);
  static updateTask = ProjectTaskService.updateTask.bind(ProjectTaskService);
  static deleteTask = ProjectTaskService.deleteTask.bind(ProjectTaskService);
  static assignTask = ProjectTaskService.assignTask.bind(ProjectTaskService);
  static unassignTask = ProjectTaskService.unassignTask.bind(ProjectTaskService);
  static getTaskComments = ProjectTaskService.getTaskComments.bind(ProjectTaskService);
  static createTaskComment = ProjectTaskService.createTaskComment.bind(ProjectTaskService);
  static getTaskTimeTracking = ProjectTimeService.getTaskTimeTracking.bind(ProjectTimeService);
  static logTime = ProjectTimeService.logTime.bind(ProjectTimeService);
}
