const fs = require('fs');
const path = require('path');

const srcFile = 'd:/Oru/frontend/src/services/api/projects/project-service.ts';
const destDir = 'd:/Oru/frontend/src/services/api/projects/project-service';
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
const lines = fs.readFileSync(srcFile, 'utf8').split('\n');

function getBlock(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

// 1. types.ts (10-174)
fs.writeFileSync(path.join(destDir, 'types.ts'), getBlock(10, 174));

// 2. _base.ts (177-205)
const baseContent = `import { BaseApiService } from '../../core/base';
import { getAgencyId as fetchAgencyId } from '@/utils/agencyUtils';
import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';

export abstract class BaseProjectService extends BaseApiService {
${getBlock(177, 205).replace('private async getAgencyId', 'protected async getAgencyId').replace('private async generateProjectCode', 'protected async generateProjectCode').replace('getAgencyId(profile', 'fetchAgencyId(profile')}
}
`;
fs.writeFileSync(path.join(destDir, '_base.ts'), baseContent);

// Common imports for sub-services
const imports = `import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';
import { BaseProjectService } from './_base';
import { Project, Task, TaskAssignment, TaskComment, TimeTracking, ProjectFilters, TaskFilters } from './types';\n\n`;

// 3. core.ts (206-380)
const coreContent = imports + `export class ProjectCoreService extends BaseProjectService {\n${getBlock(206, 380)}\n}\n`;
fs.writeFileSync(path.join(destDir, 'core.ts'), coreContent);

// 4. tasks.ts (381-762)
const tasksContent = imports + `export class ProjectTaskService extends BaseProjectService {\n${getBlock(381, 762)}\n}\n`;
fs.writeFileSync(path.join(destDir, 'tasks.ts'), tasksContent);

// 5. time.ts (763-827)
const timeContent = imports + `export class ProjectTimeService extends BaseProjectService {\n${getBlock(763, 827)}\n}\n`;
fs.writeFileSync(path.join(destDir, 'time.ts'), timeContent);

// 6. extended.ts (828-984)
const extendedContent = imports + `export class ProjectExtendedService extends BaseProjectService {\n${getBlock(828, 984)}\n}\n`;
fs.writeFileSync(path.join(destDir, 'extended.ts'), extendedContent);

// 7. index.ts
const indexContent = `import { ProjectCoreService } from './core';
import { ProjectTaskService } from './tasks';
import { ProjectTimeService } from './time';
import { ProjectExtendedService } from './extended';

export * from './types';

class ProjectService {
  private core = new ProjectCoreService();
  private tasks = new ProjectTaskService();
  private time = new ProjectTimeService();
  private extended = new ProjectExtendedService();

  // Core
  public getProjects = this.core.getProjects.bind(this.core);
  public getProject = this.core.getProject.bind(this.core);
  public createProject = this.core.createProject.bind(this.core);
  public updateProject = this.core.updateProject.bind(this.core);
  public deleteProject = this.core.deleteProject.bind(this.core);

  // Tasks
  public getTasks = this.tasks.getTasks.bind(this.tasks);
  public getTask = this.tasks.getTask.bind(this.tasks);
  public createTask = this.tasks.createTask.bind(this.tasks);
  public updateTask = this.tasks.updateTask.bind(this.tasks);
  public deleteTask = this.tasks.deleteTask.bind(this.tasks);
  public assignTask = this.tasks.assignTask.bind(this.tasks);
  public unassignTask = this.tasks.unassignTask.bind(this.tasks);
  public getTaskComments = this.tasks.getTaskComments.bind(this.tasks);
  public createTaskComment = this.tasks.createTaskComment.bind(this.tasks);

  // Time
  public getTaskTimeTracking = this.time.getTaskTimeTracking.bind(this.time);
  public logTime = this.time.logTime.bind(this.time);

  // Extended
  public getProjectWithClient = this.extended.getProjectWithClient.bind(this.extended);
  public getProjectWithFinancials = this.extended.getProjectWithFinancials.bind(this.extended);
  public getProjectsByClient = this.extended.getProjectsByClient.bind(this.extended);
  public getProjectsByEmployee = this.extended.getProjectsByEmployee.bind(this.extended);
  public getProjectWithTeam = this.extended.getProjectWithTeam.bind(this.extended);
}

export const projectService = new ProjectService();
export default projectService;
`;
fs.writeFileSync(path.join(destDir, 'index.ts'), indexContent);

// 8. delete the old project-service.ts
fs.unlinkSync(srcFile);

console.log("Projects API successfully split.");
