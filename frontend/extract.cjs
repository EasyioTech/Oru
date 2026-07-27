const fs = require('fs');
const files = [
  'd:/Oru/frontend/src/services/api/assets/index.ts',
  'd:/Oru/frontend/src/services/api/procurement/index.ts',
  'd:/Oru/frontend/src/services/api/projects/project-service.ts'
];
for (const file of files) {
  console.log('--- ' + file + ' ---');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.match(/^export\s+(interface|async function|class|const|function|type|enum)/)) {
      console.log(`${i+1}: ${line.trim()}`);
    }
  });
}
