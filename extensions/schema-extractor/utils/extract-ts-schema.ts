import ts, {
  isMethodDeclaration,
  NamedDeclaration,
  isVariableStatement,
  SourceFile,
  VariableStatement,
} from 'typescript';
import fs from 'fs';
import path from 'path';
import { serialize } from 'v8';

interface DocEntry {
  name?: string;
  fileName?: string;
  documentation?: string;
  modifiers?: string[];
  type?: string;
  kind?: string;
  heritages?: DocEntry[];
  constructors?: DocEntry[];
  methods?: DocEntry[][]; //my
  parameters?: DocEntry[];
  returnType?: string;
}

/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(fileNames: string[], outDir: string, options: ts.CompilerOptions): void {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram(fileNames, options);
  //   const _ts = ts;

  // Get the checker, we will use it to find more about classes
  let checker = program.getTypeChecker();
  let output: DocEntry[] = [];

  // Visit every sourceFile in the program
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      // Walk the tree to search for classes
      ts.forEachChild(sourceFile, visit);
    }
  }

  // print out the doc
  fs.writeFileSync(path.join(outDir, 'classes.json'), JSON.stringify(output, undefined, 4));

  return;

  /** visit nodes finding exported classes */
  function visit(node: ts.Node) {
    // Only consider exported nodes
    if (!isNodeExported(node)) {
      return;
    }

    //is class
    if (ts.isClassDeclaration(node) && node.name) {
      // This is a top level class, get its symbol
      let symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        output.push(serializeClass(symbol));
      }
      // No need to walk any further, class expressions/inner declarations
      // cannot be exported
    }

    //is interface
    if (ts.isInterfaceDeclaration(node) && node.name) {
    }

    //is node
    else if (ts.isModuleDeclaration(node)) {
      //is node
      // This is a namespace, visit its children
      ts.forEachChild(node, visit);
    }
  }

  /** Serialize a symbol into a json object */
  function serializeSymbol(symbol: ts.Symbol): DocEntry {
    return {
      name: symbol.getName(),
      documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
      type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)),
    };
  }

  /** Serialize a class symbol information */
  function serializeClass(symbol: ts.Symbol) {
    const _ts = ts;
    let details = serializeSymbol(symbol);

    details.kind = 'class'; //????

    // heritage
    details.heritages = symbol.declarations
      .map((declaration) => {
        return (declaration as any).heritageClauses?.map((heritageClause) => ({
          kind: ts.SyntaxKind[heritageClause.token],
          parents: heritageClause.types.map((type) => type.getText()),
          // parent: heritageClause.types[0].getText()
        }));
      })
      .reduce((accArr, arr) => accArr.concat(arr), []);

    // Get the construct signatures
    const constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
    details.constructors = constructorType.getConstructSignatures().map(serializeSignature);

    // Get the methods signatures
    const members: Array<any> = [];
    symbol.members?.forEach((m) => members.push(m));
    details.methods = [];

    members.filter(isMembersMethodDeclaration).forEach((member) => {
      const memberType = checker.getTypeOfSymbolAtLocation(member, member.valueDeclaration);
      const methodsSignatures = memberType.getCallSignatures().map(serializeSignature);

      details.methods!.push(methodsSignatures);
    });

    return details;
  }

  function serializeSignature(signature: ts.Signature) {
    const sourceFile = signature.declaration?.getSourceFile();
    const { line, character } = sourceFile?.getLineAndCharacterOfPosition(signature.declaration?.getStart()!) || {
      line: 'NaN',
      character: 'NaN',
    };

    return {
      documentation: ts.displayPartsToString(signature.getDocumentationComment(checker)),
      name: (signature?.declaration as any)?.name?.escapedText || undefined,
      modifiers:
        (signature?.declaration as any)?.modifiers?.map((modifier) => ts.SyntaxKind[modifier.kind]) || undefined,
      parameters: signature.parameters.map(serializeSymbol),
      returnType: checker.typeToString(signature.getReturnType()),
      text: signature.declaration?.getText(),
      location: {
        sourceFilePath: sourceFile?.getSourceFile().fileName,
        line,
        character,
      },
    };
  }

  /** True if this is visible outside this file, false otherwise */
  function isNodeExported(node: ts.Node): boolean {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
      (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    );
  }
}

// utils
function isMembersMethodDeclaration(member) {
  return member.declarations.some(isMethodDeclaration);
}

// =================================================================
const inputFiles = [
  // '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/extensions/pubsub/index.ts',
  // '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/extensions/scope/scope-badge.ts',
  '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/extensions/react/index.ts',
  '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/src/cli/commands/private-cmds/resolver-cmd.ts',
  '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/extensions/aspect/index.ts',
  '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/src/version/exceptions/invalid-version-change.ts',
];
const outputDir = '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/extensions/schema-extractor/utils/output';

generateDocumentation(inputFiles, outputDir, {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
});
