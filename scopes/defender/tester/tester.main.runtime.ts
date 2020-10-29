import { CLIAspect, CLIMain, MainRuntime } from '@teambit/cli';
import { Component } from '@teambit/component';
import { EnvsAspect, EnvsMain, EnvsExecutionResult } from '@teambit/environments';
import { LoggerAspect, LoggerMain } from '@teambit/logger';
import { Workspace, WorkspaceAspect } from '@teambit/workspace';
import { GraphqlAspect, GraphqlMain } from '@teambit/graphql';
import { UiMain, UIAspect } from '@teambit/ui';
import { merge } from 'lodash';

import { Tests } from './tester';
import { TestsResult } from './tests-results';
import { TestCmd } from './test.cmd';
import { TesterAspect } from './tester.aspect';
import { TesterService } from './tester.service';
import { TesterTask } from './tester.task';
import { testerSchema } from './tester.graphql';

export type TesterExtensionConfig = {
  /**
   * regex of the text environment.
   */
  testRegex: string;

  /**
   * determine whether to watch on start.
   */
  watchOnStart: boolean;
};

export type TesterOptions = {
  /**
   * start the tester in watch mode.
   */
  watch: boolean;

  /**
   * start the tester in debug mode.
   */
  debug: boolean;

  /**
   * initiate the tester on given env.
   */
  env?: string;
};

export class TesterMain {
  static runtime = MainRuntime;
  static dependencies = [CLIAspect, EnvsAspect, WorkspaceAspect, LoggerAspect, GraphqlAspect, UIAspect];

  constructor(
    /**
     * graphql extension.
     */
    private graphql: GraphqlMain,

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
    readonly service: TesterService,

    /**
     * build task.
     */
    readonly task: TesterTask
  ) {}

  _testsResults: EnvsExecutionResult<Tests> | undefined;

  async test(components: Component[], opts?: TesterOptions) {
    const options = this.getOptions(opts);
    const envsRuntime = await this.envs.createEnvironment(components);
    if (opts?.env) {
      return envsRuntime.runEnv(opts.env, this.service, options);
    }
    const results = await envsRuntime.run(this.service, options);
    return results;
  }

  /**
   * watch all components for changes and test upon each.
   */
  async watch(components: Component[], opts?: TesterOptions) {
    const options = this.getOptions(opts);
    const envsRuntime = await this.envs.createEnvironment(components);
    if (opts?.env) {
      return envsRuntime.runEnv(opts.env, this.service, options);
    }
    const results = await envsRuntime.run(this.service, options);
    this._testsResults = results;
    return results;
  }

  async uiWatch() {
    const components = await this.workspace.list();
    this.watch(components, { watch: true, debug: false });
  }

  getTestsResults(component: Component): TestsResult | undefined {
    const entry = component.state.aspects.get(TesterAspect.id);
    if (entry) return entry?.data.tests;
    return this.getTestsResultsFromState(component);
  }

  private getTestsResultsFromState(component: Component) {
    const env = this.envs.getEnv(component);
    const envTests = this._testsResults?.results.find((data) => data.env.id === env.id);
    const data = envTests?.data?.components?.find((c) => c.componentId.isEqual(component.id));
    return data?.results;
  }

  private getOptions(options?: TesterOptions): TesterOptions {
    const defaults = {
      watch: false,
      debug: false,
    };

    return merge(defaults, options);
  }

  static defaultConfig = {
    /**
     * default test regex for which files tester to apply on.
     */
    testRegex: '*.{spec,test}.{js,jsx,ts,tsx}',

    watchOnStart: true,
  };

  static async provider(
    [cli, envs, workspace, loggerAspect, graphql, ui]: [CLIMain, EnvsMain, Workspace, LoggerMain, GraphqlMain, UiMain],
    config: TesterExtensionConfig
  ) {
    const logger = loggerAspect.createLogger(TesterAspect.id);
    // @todo: Ran to fix.
    // @ts-ignore
    const tester = new TesterMain(
      graphql,
      envs,
      workspace,
      new TesterService(workspace, config.testRegex, logger, graphql.pubsub),
      new TesterTask(TesterAspect.id)
    );
    if (workspace && !workspace.consumer.isLegacy) {
      cli.unregister('test');
      ui.registerOnStart(async () => {
        if (!config.watchOnStart) return;
        tester.uiWatch();
      });

      cli.register(new TestCmd(tester, workspace, logger));
    }

    graphql.register(testerSchema(tester, graphql));

    return tester;
  }
}

TesterAspect.addRuntime(TesterMain);