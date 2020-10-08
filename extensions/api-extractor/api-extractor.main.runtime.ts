import { MainRuntime } from '@teambit/cli';

import ts from 'typescript';
import * as fs from 'fs-extra';
import * as tmp from 'tmp';
import * as path from 'path';
import { Extractor, ExtractorConfig, ExtractorResult, IExtractorConfigPrepareOptions, ExtractorLogLevel } from '@microsoft/api-extractor';

import { ApiExtractorAspect } from './api-extractor.aspect';

export class ApiExtractorMain {

  public generateDocs(componentsPaths: string[], verbose) {
    //TEMP path
    const t = '/Users/uritalyosef/Desktop/BIT/bad-jokes-workspace/etc/';

    // Creating temp folder
    const tmpobj = tmp.dirSync({prefix: 'bit.dev.temp-', keep: false, unsafeCleanup: true});
    const tmpFolderPath = tmpobj.name;
    
    if(verbose)
      console.log(`Writing temporary files to ${tmpFolderPath}`);

    // Creating DTS files
    const dtsCreationOutputPathArray = this.createDtsFiles(componentsPaths, tmpFolderPath, verbose);

    // Extracting API from DTS files
    // const t = '/Users/uritalyosef/Desktop/BIT/bad-jokes-workspace/etc/'; //TEMP
    const apiOutputPathArray = dtsCreationOutputPathArray.map((r) => this.extractapi(r, t, verbose));

    // Get results
    const res = apiOutputPathArray.map(paths => ({
      apiJsonFileStr: fs.readFileSync(paths.apiJsonFilePath, {encoding: 'utf-8'}),
      tsdocMetadataFileStr: fs.readFileSync(paths.tsdocMetadataFilePath, {encoding: 'utf-8'})
    }))
    
    console.log('---> ', res)

    //cleanup
    tmpobj.removeCallback();
  }

  public createDtsFiles(componentsPaths: string[], tmpFolderPath: string, verbose: boolean) {
    return componentsPaths.map((componentPath) => this.createDtsFile(componentPath, tmpFolderPath, verbose));
  }

  public createDtsFile(componentPath: string, dtsOutputFolder: string, verbose: boolean) {
    
    const rootFilePath = path.join(componentPath, 'index.ts');

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
      outDir: dtsOutputFolder,
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
    
    //Compilation
    let program = ts.createProgram([rootFilePath], options);
    let emitResult = program.emit();


    if(verbose){ 
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
    }
      
    return {
      rootFilePath,
      componentPath,
      dtsOutputFolder,
    };
  }

  public extractapi(paths: any, outputFolder: string, verbose: boolean) {
    const apiExtractorJsonPath: string = path.join(__dirname, '../config/api-extractor.json');
    const componentName = path.basename(paths.componentPath);
    const packageJsonFullPath = path.join(__dirname, '../config/_package.json'); // Due to a Bug
    
    // TODO output folter
    const apiJsonFilePath = path.join(outputFolder, componentName,`${componentName}.api.json`); 
    const tsdocMetadataFilePath = path.join(outputFolder, componentName, `tsdoc-metadata.json`); 
    

    // Load Api-Extractor configurations
     let configFile = ExtractorConfig.loadFile(apiExtractorJsonPath);
     
    
     configFile.mainEntryPointFilePath = path.join(paths.dtsOutputFolder, 'index.d.ts');
     configFile.docModel.apiJsonFilePath = apiJsonFilePath;
     configFile.tsdocMetadata.tsdocMetadataFilePath = tsdocMetadataFilePath;
     
    
     //  Configure messaging level
    if(!verbose){
      configFile.messages.compilerMessageReporting.default.logLevel = 'none';
      Object.keys(configFile.messages.compilerMessageReporting).forEach(k => {
        configFile.messages.compilerMessageReporting[k].logLevel = 'none';
      })
      configFile.messages.tsdocMessageReporting.default.logLevel = 'none';
    }
     
     const extractorConfigPrepareOptions: IExtractorConfigPrepareOptions = {
      configObject: configFile,
      configObjectFullPath: apiExtractorJsonPath,
      packageJsonFullPath: packageJsonFullPath,
      projectFolderLookupToken: paths.componentPath
     }

     let extractorConfig: ExtractorConfig = ExtractorConfig.prepare(extractorConfigPrepareOptions);

      
    // Invoke API Extractor
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
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

    return {
      tsdocMetadataFilePath,
      apiJsonFilePath
    }
  }

  static runtime = MainRuntime;

  static async provider() {
    return new ApiExtractorMain();
  }
}

ApiExtractorAspect.addRuntime(ApiExtractorMain);
