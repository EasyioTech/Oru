const fs = require('fs');
const { Project, SyntaxKind } = require('ts-morph');

async function run() {
  let raw = fs.readFileSync('eslint-output.json');
  let str = (raw[0] === 0xFF && raw[1] === 0xFE) ? raw.toString('utf16le') : raw.toString('utf8');
  const data = JSON.parse(str);
  
  const affectedFiles = data
    .filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-use-before-define'))
    .map(f => f.filePath);
    
  console.log(`Found ${affectedFiles.length} files with TDZ issues.`);
  
  const project = new Project();
  
  for (const filePath of affectedFiles) {
    const sourceFile = project.addSourceFileAtPath(filePath);
    let changed = false;
    
    // Find all arrow functions assigned to variables (functional components)
    // or standard function declarations
    const variables = sourceFile.getVariableDeclarations();
    for (const variable of variables) {
      const init = variable.getInitializer();
      if (init && (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression)) {
        changed = fixComponent(init) || changed;
      }
    }
    
    const functions = sourceFile.getFunctions();
    for (const func of functions) {
      changed = fixComponent(func) || changed;
    }
    
    if (changed) {
      await sourceFile.save();
      console.log(`Fixed: ${filePath}`);
    }
  }
}

function fixComponent(componentFunc) {
  const body = componentFunc.getBody();
  if (!body || body.getKind() !== SyntaxKind.Block) return false;
  
  const statements = body.getStatements();
  const useEffects = [];
  let firstReturnIndex = -1;
  let firstIfReturnIndex = -1;
  
  // Find useEffects and returns
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Check if it's a useEffect
    if (stmt.getKind() === SyntaxKind.ExpressionStatement) {
      const expr = stmt.getExpression();
      if (expr.getKind() === SyntaxKind.CallExpression) {
        const identifier = expr.getExpression();
        if (identifier.getText() === 'useEffect') {
          useEffects.push({ stmt, index: i });
        }
      }
    }
    
    // Check for returns
    if (stmt.getKind() === SyntaxKind.ReturnStatement && firstReturnIndex === -1) {
      firstReturnIndex = i;
    }
    
    // Check for if statements with returns
    if (stmt.getKind() === SyntaxKind.IfStatement && firstIfReturnIndex === -1) {
      const thenStmt = stmt.getThenStatement();
      if (thenStmt.getKind() === SyntaxKind.Block) {
         if (thenStmt.getStatements().some(s => s.getKind() === SyntaxKind.ReturnStatement)) {
            firstIfReturnIndex = i;
         }
      } else if (thenStmt.getKind() === SyntaxKind.ReturnStatement) {
         firstIfReturnIndex = i;
      }
    }
  }
  
  if (useEffects.length === 0) return false;
  
  // Target index is right before the first return/if-return, or at the end
  let targetIndex = statements.length;
  if (firstReturnIndex !== -1) targetIndex = Math.min(targetIndex, firstReturnIndex);
  if (firstIfReturnIndex !== -1) targetIndex = Math.min(targetIndex, firstIfReturnIndex);
  
  // If all useEffects are already before the target index, and all useCallbacks are before useEffects...
  // It's easier just to extract their text, remove them, and insert them at targetIndex.
  let changed = false;
  
  // Sort reverse so index removal doesn't shift things
  for (let i = useEffects.length - 1; i >= 0; i--) {
    const ue = useEffects[i];
    // We only move it if it's placed before standard var declarations that it might depend on.
    // To blindly fix TDZ, moving them all to the bottom (just above returns) is 100% safe.
    if (ue.index < targetIndex - 1) {
      const text = ue.stmt.getText();
      ue.stmt.remove();
      body.insertStatements(targetIndex - 1, text);
      changed = true;
    }
  }
  
  return changed;
}

run().catch(console.error);
