import * as path from 'path';
import ts from 'typescript';

const CompilerOptionsBase: ts.CompilerOptions = {
  jsx: ts.JsxEmit.React,
  allowJs: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2015,
  resolveJsonModule: true, //?
  esModuleInterop: true, // to false
  emitDeclarationOnly: true,
  declaration: true,
  sourceMap: true,
  declarationMap: true,
  noEmitOnError: false,
  lib: ['DOM', 'ES5', 'ScriptHost'],
  // listEmittedFiles: true
  //suppressExcessPropertyErrors: true
  //isolatedModules: true

  // paths: {
  //   // "graphql-compose": ["node_modules/graphql-compose/"]
  //   "@teambit/*": ["node_modules/@teambit/"]
  // },
};

export const createDtsFile = (
  componentPath: string,
  rootFileName: string = 'index.ts',
  dtsOutputFolder: string,
  onOutput: (e, msg: string) => void
) => {
  const rootFilePath = path.join(componentPath, rootFileName);

  let compilerOptions = CompilerOptionsBase;
  compilerOptions.outDir = dtsOutputFolder;

  let program = ts.createProgram([rootFilePath], compilerOptions);
  let emitResult = program.emit();

  let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      onOutput(null, `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      onOutput(null, ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  return {
    rootFilePath,
    componentPath,
    dtsOutputFolder,
  };
};
