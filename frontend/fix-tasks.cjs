const fs = require('fs');
const path = require('path');

const dir = 'd:/Oru/frontend/src/services/api/projects/project-service';
const tasksFile = path.join(dir, 'tasks.ts');
const lines = fs.readFileSync(tasksFile, 'utf8').split('\n');

// Find the line that says "Task Assignments"
let splitIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Task Assignments')) {
    splitIdx = i - 1; // get the /** line above it
    break;
  }
}

if (splitIdx !== -1) {
  const imports = `import { selectRecords, selectOne, insertRecord, updateRecord, deleteRecord } from '../../core';
import { BaseProjectService } from './_base';
import { Project, Task, TaskAssignment, TaskComment, TimeTracking, ProjectFilters, TaskFilters } from './types';\n\n`;

  const tasksLines = lines.slice(0, splitIdx);
  // Add closing brace since we cut it off
  tasksLines.push('}\n');
  
  const actionsLines = lines.slice(splitIdx, lines.length - 1); // remove the last closing brace from original
  const taskActionsContent = imports + `export class ProjectTaskActionService extends BaseProjectService {\n` + actionsLines.join('\n') + `\n}\n`;

  fs.writeFileSync(tasksFile, tasksLines.join('\n'));
  fs.writeFileSync(path.join(dir, 'task-actions.ts'), taskActionsContent);

  // Update index.ts
  const indexFile = path.join(dir, 'index.ts');
  let indexContent = fs.readFileSync(indexFile, 'utf8');
  indexContent = indexContent.replace(
    "import { ProjectTaskService } from './tasks';",
    "import { ProjectTaskService } from './tasks';\nimport { ProjectTaskActionService } from './task-actions';"
  );
  indexContent = indexContent.replace(
    "private tasks = new ProjectTaskService();",
    "private tasks = new ProjectTaskService();\n  private taskActions = new ProjectTaskActionService();"
  );
  indexContent = indexContent.replace(
    "public assignTask = this.tasks.assignTask.bind(this.tasks);",
    "public assignTask = this.taskActions.assignTask.bind(this.taskActions);"
  );
  indexContent = indexContent.replace(
    "public unassignTask = this.tasks.unassignTask.bind(this.tasks);",
    "public unassignTask = this.taskActions.unassignTask.bind(this.taskActions);"
  );
  indexContent = indexContent.replace(
    "public getTaskComments = this.tasks.getTaskComments.bind(this.tasks);",
    "public getTaskComments = this.taskActions.getTaskComments.bind(this.taskActions);"
  );
  indexContent = indexContent.replace(
    "public createTaskComment = this.tasks.createTaskComment.bind(this.tasks);",
    "public createTaskComment = this.taskActions.createTaskComment.bind(this.taskActions);"
  );
  
  fs.writeFileSync(indexFile, indexContent);
  console.log('Successfully split tasks.ts and updated index.ts');
} else {
  console.log('Could not find split point');
}
