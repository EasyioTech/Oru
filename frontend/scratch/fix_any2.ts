import { Project, SyntaxKind, Node } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths([
  "src/components/**/*.{ts,tsx}", 
  "src/pages/**/*.{ts,tsx}"
]);

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;

  // Since replaceWithText modifies the AST, it's safer to collect nodes and replace in reverse order
  // or just run it multiple times. We'll do it in reverse order.
  const anyNodes: Node[] = [];
  
  sourceFile.forEachDescendant(node => {
    if (node.getKind() === SyntaxKind.AnyKeyword) {
      anyNodes.push(node);
    }
  });

  // Process in reverse to avoid invalidating offsets
  for (let i = anyNodes.length - 1; i >= 0; i--) {
    const node = anyNodes[i];
    try {
      node.replaceWithText("unknown");
      changed = true;
    } catch (e) {
      console.log("Failed to replace node");
    }
  }

  if (changed) {
    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getFilePath()}`);
  }
}
