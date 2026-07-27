import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';
import path from 'path';

// 1. Rename directory
const oldDir = 'd:/Oru/frontend/src/services/api/projects/project-service';
const newDir = 'd:/Oru/frontend/src/services/api/projects/project';
const facadeFile = 'd:/Oru/frontend/src/services/api/projects/project-service.ts';

if (fs.existsSync(oldDir)) {
  fs.renameSync(oldDir, newDir);
}
const oldIndex = path.join(newDir, 'index.ts');
if (fs.existsSync(oldIndex)) {
  fs.unlinkSync(oldIndex);
}

const project = new Project();
project.addSourceFilesAtPaths(`${newDir}/*.ts`);

const sourceFiles = project.getSourceFiles().filter(f => f.getBaseName() !== '_base.ts' && f.getBaseName() !== 'types.ts');

const facadeExports = [];

for (const sf of sourceFiles) {
  const classes = sf.getClasses();
  if (classes.length === 0) continue;

  const cls = classes[0];
  const className = cls.getName();
  cls.setExtends('BaseApiService'); 
  
  const methods = cls.getMethods();
  const methodNames = [];
  
  for (const method of methods) {
    const name = method.getName();
    if (!name || name === 'constructor') continue;
    method.setIsStatic(true);
    methodNames.push(name);
  }
  
  const imports = sf.getImportDeclarations();
  const hasBaseApi = imports.some(i => i.getModuleSpecifierValue() === '../../core');
  if (!hasBaseApi) {
    sf.addImportDeclaration({
      namedImports: ['BaseApiService', 'ApiOptions'],
      moduleSpecifier: '../../core'
    });
  }
  
  const baseImport = sf.getImportDeclaration(i => i.getModuleSpecifierValue() === './_base');
  if (baseImport) baseImport.remove();
  
  facadeExports.push({
    className,
    moduleName: sf.getBaseNameWithoutExtension(),
    methodNames
  });
}

// Write the facade
let facadeText = '';
for (const item of facadeExports) {
  facadeText += `import { ${item.className} } from './project/${item.moduleName}';\n`;
}
facadeText += `export * from './project/types';\n\n`;

facadeText += `export class ProjectService {\n`;
for (const item of facadeExports) {
  for (const method of item.methodNames) {
    facadeText += `  static ${method} = ${item.className}.${method}.bind(${item.className});\n`;
  }
}
facadeText += `}\n`;

fs.writeFileSync(facadeFile, facadeText);

project.saveSync();
console.log("Projects refactoring complete.");
