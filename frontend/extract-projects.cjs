const fs = require('fs');
const lines = fs.readFileSync('d:/Oru/frontend/src/services/api/projects/project-service.ts', 'utf8').split('\n');
lines.forEach((line, i) => {
  if (line.includes('class ') || line.includes('async ') || line.includes('function ')) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});
