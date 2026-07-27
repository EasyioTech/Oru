import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();

// Paths to process
const domains = [
  'd:/Oru/frontend/src/services/api/assets',
  'd:/Oru/frontend/src/services/api/procurement'
];

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getClassName(filename) {
  let base = filename.replace('.ts', '');
  if (base === 'assets') base = 'assets-crud';
  if (base === 'reports') base = 'reports-crud';
  
  const parts = base.split('-');
  return parts.map(capitalize).join('') + 'Service';
}

for (const domain of domains) {
  project.addSourceFilesAtPaths(`${domain}/*.ts`);
  const sourceFiles = project.getSourceFiles().filter(f => {
    const name = f.getBaseName();
    return name !== 'index.ts' && name !== '_client.ts';
  });

  const indexFile = project.getSourceFile(`${domain}/index.ts`);
  const indexExports = [];

  for (const sf of sourceFiles) {
    const functions = sf.getFunctions().filter(f => f.isExported() && f.isAsync());
    if (functions.length === 0) continue;

    const className = getClassName(sf.getBaseName());
    
    // Create class
    const classDecl = sf.addClass({
      name: className,
      isExported: true,
      extends: 'BaseApiService'
    });

    const methodNames = [];

    for (const func of functions) {
      const name = func.getName();
      methodNames.push(name);
      
      const params = func.getParameters().map(p => ({
        name: p.getName(),
        type: p.getTypeNode()?.getText() || 'any',
        hasQuestionToken: p.hasQuestionToken(),
        initializer: p.getInitializer()?.getText()
      }));

      // Add options param
      params.push({
        name: 'options',
        type: 'ApiOptions',
        initializer: '{}'
      });

      const returnType = func.getReturnTypeNode()?.getText() || 'any';
      const bodyText = func.getBodyText();

      classDecl.addMethod({
        isStatic: true,
        isAsync: true,
        name: name,
        parameters: params,
        returnType: returnType,
        statements: `return this.execute(async () => {\n${bodyText}\n}, options).then((res: any) => {\n  if (res.error) throw new Error(res.error);\n  return res.data;\n});`
      });

      // Remove the original function
      func.remove();
    }

    // Add imports
    const imports = sf.getImportDeclarations();
    const hasBaseApi = imports.some(i => i.getModuleSpecifierValue() === '../core');
    if (!hasBaseApi) {
      sf.addImportDeclaration({
        namedImports: ['BaseApiService', 'ApiOptions'],
        moduleSpecifier: '../core'
      });
    }

    indexExports.push({ className, methodNames });
  }

  // Update index.ts
  if (indexFile && indexExports.length > 0) {
    let newIndexText = '';
    
    // Add imports for all classes
    for (const item of indexExports) {
      const moduleName = sourceFiles.find(sf => getClassName(sf.getBaseName()) === item.className).getBaseNameWithoutExtension();
      newIndexText += `export * from './${moduleName}';\n`;
    }
    
    newIndexText += `export * from './_client';\n\n`; // just in case
    
    const domainName = capitalize(domain.split('/').pop());
    const serviceName = `${domainName}Service`;
    
    newIndexText += `export class ${serviceName} {\n`;
    for (const item of indexExports) {
      for (const method of item.methodNames) {
        newIndexText += `  static ${method} = ${item.className}.${method}.bind(${item.className});\n`;
      }
    }
    newIndexText += `}\n`;
    
    indexFile.replaceWithText(newIndexText);
  }
}

project.saveSync();
console.log("Assets and Procurement refactoring complete.");
