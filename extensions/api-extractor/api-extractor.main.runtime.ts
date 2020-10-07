import { MainRuntime } from '@teambit/cli';

import ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';

import { ApiExtractorAspect } from './api-extractor.aspect';

export class ApiExtractorMain {
  public generateDocs(componentsPaths: string[], verbose) {
    const res = this.createDtsFiles(componentsPaths); //1.
    res.forEach((r) => this.extractapi(r, verbose)); //2.
  }

  public createDtsFiles(componentsPaths: string[]) {
    return componentsPaths.map((componentPath) => this.createDtsFile(componentPath));
  }

  public createDtsFile(componentPath: string) {
    // const fileNames = componentsPaths.map(componentsPath => path.join(componentsPath, 'index.ts'))
    const fileNames = path.join(componentPath, 'index.ts');
    const typesFolder = path.join(componentPath, 'types');

    const options: ts.CompilerOptions = {
      jsx: ts.JsxEmit.React,
      allowJs: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2015,
      resolveJsonModule: true,
      esModuleInterop: true,
      emitDeclarationOnly: true,
      declaration: true,
      sourceMap: true,
      declarationMap: true,
      noEmitOnError: false,
      // noImplicitAny: false,
      // outDir: 'lib2',
      outDir: typesFolder,
      lib: ['es5'],
      // disableSourceOfProjectReferenceRedirect:true,
      // disableSolutionSearching: true,
      // assumeChangesOnlyAffectDirectDependencies: true,
      // noLib: true,
      // noResolve: true,
      // noResolve: false,
      // skipLibCheck: true,
      // typeRoots:["/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/extensions/compiler"]
      // rootDirs: ['/Users/uritalyosef/Desktop/BIT/bad-jokes-workspace/components']
    };
    let program = ts.createProgram([fileNames], options);
    let emitResult = program.emit();

    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach((diagnostic) => {
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      }
    });

    return {
      fileNames,
      componentPath,
      typesFolder,
    };
  }

  public extractapi(paths: any, verbose) {
    const apiExtractorJsonPath: string = path.join(__dirname, '../config/api-extractor.json');
    const reportPath: string = path.join(paths.componentPath, 'report');

    // This is a hack needs a temp file to exist (bad-hack.d)
    let extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);
    extractorConfig.mainEntryPointFilePath = path.join(paths.typesFolder, 'index.d.ts');

    // This is the right implementation, not working due to bug in api-extractor.
    /**
     const options = ExtractorConfig.loadFile(apiExtractorJsonPath);
     options.mainEntryPointFilePath = path.join(paths.typesFolder, 'index.d.ts');
     let extractorConfig: ExtractorConfig = ExtractorConfig.prepare(options);
     */

    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath);
    }
    extractorConfig.reportFolder = reportPath;
    extractorConfig.reportFilePath = path.join(reportPath, 'api-extractor.api.md');
    extractorConfig.reportTempFilePath = path.join(reportPath, 'temp/api-extractor.api.md');

    // Invoke API Extractor
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      // Equivalent to the "--local" command-line parameter
      localBuild: true,

      // Equivalent to the "--verbose" command-line parameter
      showVerboseMessages: verbose,
    });

    if (extractorResult.succeeded) {
      console.error(`API Extractor completed successfully`);
      // process.exitCode = 0;
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`
      );
      // process.exitCode = 1;
    }
  }

  static runtime = MainRuntime;

  static async provider() {
    return new ApiExtractorMain();
  }
}

ApiExtractorAspect.addRuntime(ApiExtractorMain);
