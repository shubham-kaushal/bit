import { CLIAspect, MainRuntime, CLIMain } from '@teambit/cli';
import { Component } from '@teambit/component';
import { EnvsAspect, EnvsMain } from '@teambit/environments';
import { LoggerAspect, LoggerMain } from '@teambit/logger';
import { Workspace, WorkspaceAspect } from '@teambit/workspace';
import { GraphqlAspect, GraphqlMain } from '@teambit/graphql';

import ts from 'typescript';
import * as fs from 'fs-extra';
import glob from 'glob';
import * as tmp from 'tmp';
import * as path from 'path';
import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
  IExtractorConfigPrepareOptions,
  ExtractorLogLevel,
} from '@microsoft/api-extractor';

import { ApiExtractorAspect } from './api-extractor.aspect';
import { DocCmd } from './doc.cmd';
import { apiExtractorSchema } from './api-extractor.graphql';
import { ApiExtractorService } from './api-extractor.service';
import { ApiExtractorTask } from './api-extractor.task';
import { requireJsonWithComments, createDtsFile, extractapi, fixeDSTfile } from './utils';

export class ApiExtractorMain {
  constructor(
    /**
     * envs extension.
     */
    private envs: EnvsMain,

    /**
     * workspace extension.
     */
    private workspace: Workspace,

    /**
     * tester service.
     */
    readonly service: ApiExtractorService,

    /**
     * build task.
     */
    readonly task: ApiExtractorTask
  ) {}

  public async generateComponentDocsByComponentID(componentID) {
    const componentsPathsList = [this.workspace.componentDir(componentID)];
    const onOutput = (e, msg) => {
      e ? console.error(msg, e) : console.log(msg);
    };

    // Creating temp folder
    const tmpobj = tmp.dirSync({ prefix: 'dev.bit.temp-', keep: false, unsafeCleanup: true });
    try {
      const tmpFolderPath = tmpobj.name;
      const tempDtsOutputFolder = path.join(tmpFolderPath, '__tempDtsOutputFolder__');

      // Creating DTS files
      const dtsCreationOutputPathArray = this.createDtsFiles(componentsPathsList, tmpFolderPath, onOutput);

      // Extracting API from DTS files
      const apiOutputPathArray = dtsCreationOutputPathArray.map((dtsPath) =>
        extractapi(
          path.join(dtsPath.dtsOutputFolder, 'index.d.ts'),
          tempDtsOutputFolder,
          dtsPath.componentPath,
          onOutput
        )
      );

      const res = apiOutputPathArray.map((paths) => ({
        componentName: paths.componentName,
        apiJsonFileJSON: requireJsonWithComments(paths.apiJsonFilePath),
        tsdocMetadataFileJSON: requireJsonWithComments(paths.tsdocMetadataFilePath),
      }));

      //cleanup
      tmpobj.removeCallback();
      return res;
    } catch (err) {
      tmpobj.removeCallback();
      throw err;
    }
  }

  // From the command line
  public async generateDocs(onOutput: (e, msg) => void, reportOutputPath) {
    // getComponentsDirectory
    let componentsList = await this.workspace.list();

    //Temp!
    // componentsList = componentsList.slice(0, 1);

    const componentsPathsList = componentsList.map((comp) => this.workspace.componentDir(comp.id));

    // Creating temp folder
    // const tmpobj = tmp.dirSync({ prefix: 'dev.bit.temp-', keep: false, unsafeCleanup: true });
    const tmpobj = tmp.dirSync({ prefix: 'dev.bit.temp-', keep: true, unsafeCleanup: false });
    try {
      const tmpFolderPath = tmpobj.name;
      const tempDtsOutputFolder = path.join(tmpFolderPath, '__tempDtsOutputFolder__');

      onOutput(null, `Writing temporary files to ${tmpFolderPath}`);

      // Creating DTS files L:1
      const dtsCreationOutputPathArray = this.createDtsFiles(componentsPathsList, tempDtsOutputFolder, onOutput);

      // Fixe DTS import problem
      dtsCreationOutputPathArray.forEach((dtsPath) => {
        this.fixeDtsFiles(dtsPath.dtsOutputFolder);
      });

      // Extracting API from DTS files L:2
      const apiOutputPathArray = dtsCreationOutputPathArray.map((dtsPath, index) => {
        return extractapi(
          path.join(dtsPath.dtsOutputFolder, 'index.d.ts'),
          tempDtsOutputFolder,
          dtsPath.componentPath,
          onOutput,
          reportOutputPath
        );
      });

      const res = apiOutputPathArray.map((paths) => ({
        componentName: paths.componentName,
        apiJsonFileJSON: requireJsonWithComments(paths.apiJsonFilePath),
        tsdocMetadataFileJSON: requireJsonWithComments(paths.tsdocMetadataFilePath),
      }));

      console.log('---> ', JSON.stringify(res));

      //cleanup
      // tmpobj.removeCallback();
      return res;
    } catch (err) {
      // tmpobj.removeCallback();
      throw err;
    }
  }

  public createDtsFiles(componentsPaths: string[], tmpFolderPath: string, onOutput: (e, msg) => void) {
    return componentsPaths.map((componentPath) => {
      const componentsName = path.basename(componentPath);
      const componentDtsOutPutTmpFolderPath = path.join(tmpFolderPath, componentsName);
      return createDtsFile(componentPath, 'index.ts', componentDtsOutPutTmpFolderPath, onOutput);
    });
  }

  private fixeDtsFiles(dtsOutputFolder) {
    const files = glob
      .sync('**/*.d.ts', { cwd: dtsOutputFolder, nodir: true })
      .map((file) => path.join(dtsOutputFolder, file));

    files.forEach((filePath) => {
      fixeDSTfile(filePath);
    });
  }

  static runtime = MainRuntime;
  static dependencies = [CLIAspect, EnvsAspect, WorkspaceAspect, LoggerAspect, GraphqlAspect];

  static async provider([cli, envs, workspace, loggerAspect, graphql]: [
    CLIMain,
    EnvsMain,
    Workspace,
    LoggerMain,
    GraphqlMain
  ]) {
    const logger = loggerAspect.createLogger(ApiExtractorAspect.id);

    const apiExtractor = new ApiExtractorMain(
      envs,
      workspace,
      new ApiExtractorService(workspace, logger),
      new ApiExtractorTask(ApiExtractorAspect.id)
    );

    cli.register(new DocCmd(apiExtractor, workspace, logger));

    const _apiExtractorSchema = apiExtractorSchema(apiExtractor);
    graphql.register(_apiExtractorSchema);
    return apiExtractor;
  }
}

ApiExtractorAspect.addRuntime(ApiExtractorMain);
