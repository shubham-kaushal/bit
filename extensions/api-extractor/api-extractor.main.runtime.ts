import { CLIAspect, MainRuntime, CLIMain } from '@teambit/cli';
import { Component } from '@teambit/component';
import { EnvsAspect, EnvsMain } from '@teambit/environments';
import { LoggerAspect, LoggerMain } from '@teambit/logger';
import { Workspace, WorkspaceAspect } from '@teambit/workspace';
import { GraphqlAspect, GraphqlMain } from '@teambit/graphql';

import ts from 'typescript';
import * as fs from 'fs-extra';
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
import { requireJsonWithComments, createDtsFile, extractapi } from './utils';

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

  public async generateDocs(onOutput: (e, msg) => void) {
    // getComponentsDirectory
    const componentsList = await this.workspace.list();
    const componentsPathsList = componentsList.map((comp) => this.workspace.componentDir(comp.id));

    // Creating temp folder
    const tmpobj = tmp.dirSync({ prefix: 'dev.bit.temp-', keep: false, unsafeCleanup: true });
    const tmpFolderPath = tmpobj.name;
    const tempDtsOutputFolder = path.join(tmpFolderPath, '__tempDtsOutputFolder__');

    onOutput(null, `Writing temporary files to ${tmpFolderPath}`);

    // Creating DTS files
    const dtsCreationOutputPathArray = this.createDtsFiles(componentsPathsList, tmpFolderPath, onOutput);

    // Extracting API from DTS files
    const apiOutputPathArray = dtsCreationOutputPathArray.map((dtsPath) =>
      extractapi(path.join(dtsPath.dtsOutputFolder, 'index.d.ts'), tempDtsOutputFolder, dtsPath.componentPath, onOutput)
    );

    const res = apiOutputPathArray.map((paths) => ({
      componentName: paths.componentName,
      apiJsonFileJSON: requireJsonWithComments(paths.apiJsonFilePath),
      tsdocMetadataFileJSON: requireJsonWithComments(paths.tsdocMetadataFilePath),
    }));

    console.log('---> ', res);

    //cleanup
    tmpobj.removeCallback();
    return res;
  }

  public createDtsFiles(componentsPaths: string[], tmpFolderPath: string, onOutput: (e, msg) => void) {
    return componentsPaths.map((componentPath) => createDtsFile(componentPath, 'index.ts', tmpFolderPath, onOutput));
  }

  // private getOutput(verbose) {
  //   return verbose
  //     ? (e, msg) => { e ? console.error(msg, e) : console.log(msg)}
  //     : (_e, _msg) => {}
  // }

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
    graphql.register(apiExtractorSchema(apiExtractor));
    return apiExtractor;
  }
}

ApiExtractorAspect.addRuntime(ApiExtractorMain);
