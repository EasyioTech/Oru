import { Project, SyntaxKind, Node } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/services/api/**/*.ts");

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;

  // 1. catch (error: any) -> catch (error)
  sourceFile.forEachDescendant(node => {
    if (Node.isCatchClause(node)) {
      const variableDeclaration = node.getVariableDeclaration();
      if (variableDeclaration) {
        const typeNode = variableDeclaration.getTypeNode();
        if (typeNode && typeNode.getKind() === SyntaxKind.AnyKeyword) {
          variableDeclaration.removeType();
          changed = true;
        }
      }
    }
  });

  // 2. Record<string, any> -> Record<string, unknown>
  sourceFile.forEachDescendant(node => {
    if (Node.isTypeReference(node)) {
      const typeName = node.getTypeName().getText();
      if (typeName === "Record") {
        const typeArgs = node.getTypeArguments();
        if (typeArgs.length === 2 && typeArgs[1].getKind() === SyntaxKind.AnyKeyword) {
          typeArgs[1].replaceWithText("unknown");
          changed = true;
        }
      }
    }
  });

  // 3. (r: any) -> (r: Record<string, unknown>) or (r: unknown)
  sourceFile.forEachDescendant(node => {
    if (Node.isParameterDeclaration(node)) {
      const typeNode = node.getTypeNode();
      if (typeNode && typeNode.getKind() === SyntaxKind.AnyKeyword) {
        const name = node.getName();
        if (["row", "r", "item", "data", "payload", "error", "err"].includes(name)) {
          typeNode.replaceWithText("Record<string, unknown>");
        } else {
          typeNode.replaceWithText("unknown");
        }
        changed = true;
      }
    }
  });

  // 4. any[] -> unknown[]
  sourceFile.forEachDescendant(node => {
    if (Node.isArrayTypeNode(node)) {
      const elemType = node.getElementTypeNode();
      if (elemType && elemType.getKind() === SyntaxKind.AnyKeyword) {
        elemType.replaceWithText("unknown");
        changed = true;
      }
    }
  });

  // 5. as any -> as unknown
  sourceFile.forEachDescendant(node => {
    if (Node.isAsExpression(node)) {
      const typeNode = node.getTypeNode();
      if (typeNode && typeNode.getKind() === SyntaxKind.AnyKeyword) {
        typeNode.replaceWithText("unknown");
        changed = true;
      }
    }
  });

  if (changed) {
    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getFilePath()}`);
  }
}
