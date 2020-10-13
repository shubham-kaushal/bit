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
};

export const createDtsFile = (
  componentRootFilePath: string,
  dtsOutputFolderPath: string,
  onOutput: (e, msg: string) => void
) => {
  let compilerOptions = CompilerOptionsBase;
  compilerOptions.outDir = dtsOutputFolderPath;

  let program = ts.createProgram([componentRootFilePath], compilerOptions);
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
    componentRootFilePath,
    dtsOutputFolderPath,
  };
};
