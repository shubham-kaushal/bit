/**
 * TODO[uri] - refactor to full blown React app (with state).
 */
import { Command, CommandOptions } from '@teambit/cli';
import { PubsubMain } from '@teambit/pubsub';
import { Logger } from '@teambit/logger';
import {
  WorkspaceAspect,
  OnComponentChangeEvent,
  OnComponentAddEvent,
  OnComponentRemovedEvent,
} from '@teambit/workspace';

import { ComponentsServerStartedEvent } from '@teambit/bundler';
import { UiServerStartedEvent } from '@teambit/ui';
import { WebpackCompilationDoneEvent } from '@teambit/webpack';

import React from 'react';
import open from 'open';
import { render, Text } from 'ink';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import type { UiMain } from './ui.main.runtime';
import {
  OnComponentChange,
  StartingMainUiServer,
  StandaloneNewLine,
  Starting,
  ClearConsole,
  ComponentPreviewServerStarted,
  UIServersAreReady,
} from './bit-start-cmd-output-templates';

export class DocCmd implements Command {
  // startingtimestamp;
  // devServerCounter = 0;
  // targetHost = 'localhost';
  // targetPort = 3000;
  name = 'doc [type] [pattern]';
  description = 'Generate documentation for all workspace or a specific component';
  alias = 'c';
  group = 'component';
  shortDescription = '';
  options = [
    // ['d', 'dev', 'start UI server in dev mode.'],
    // ['p', 'port', 'port of the UI server.'],
    // ['r', 'rebuild', 'rebuild the UI'],
    ['v', 'verbose', 'showing verbose output for inspection and prints stack trace'],
  ] as CommandOptions;

  constructor(
    /**
     * access to the extension instance.
     */
    private ui: UiMain,

    private logger: Logger,

    private pubsub: PubsubMain
  ) {}

  async render(
    [uiRootName, userPattern]: [string, string],
    { dev, port, rebuild, verbose }: { dev: boolean; port: string; rebuild: boolean; verbose: boolean }
  ): Promise<React.ReactElement> {
    this.logger.off();
    // await this.ui.createRuntime({
    //   uiRootName,
    //   pattern,
    //   dev,
    //   port: port ? parseInt(port) : undefined,
    //   rebuild,
    // });

    return (
      <>
        <Text>DOC</Text>
      </>
    );
  }
}
