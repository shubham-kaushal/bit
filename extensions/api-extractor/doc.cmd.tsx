/**
 * TODO[uri] - refactor to full blown React app (with state).
 */
import { Command, CommandOptions } from '@teambit/cli';
// import { PubsubMain } from '@teambit/pubsub';
import { Logger } from '@teambit/logger';

import type { ApiExtractorMain } from '@teambit/api-extractor';

import React from 'react';
import { render, Text } from 'ink';

// import type { UiMain } from './ui.main.runtime';
import { Workspace } from '@teambit/workspace';

export class DocCmd implements Command {
  name = 'doc [type] [pattern]';
  description = 'Generate documentation for all workspace or a specific component';
  alias = 'c';
  group = 'component';
  shortDescription = '';
  options = [
    ['p', 'path <file>/"<file>,<file>"', 'path to the root file'],
    ['v', 'verbose', 'showing verbose output for inspection and prints stack trace'],
  ] as CommandOptions;

  constructor(
    /**
     * access to the extension instance.
     */

    private apiExtractor: ApiExtractorMain,

    private workspace: Workspace,

    private logger: Logger
  ) {}

  private gatOnOutput(verbose) {
    return verbose
      ? (e, msg) => {
          e ? console.error(msg, e) : console.log(msg);
        }
      : (_e, _msg) => {};
  }

  async render(
    [uiRootName, userPattern]: [string, string],
    { path, verbose }: { path: string; verbose: boolean }
  ): Promise<React.ReactElement> {
    this.logger.off();
    this.apiExtractor.generateDocs(this.gatOnOutput(!!verbose));

    return (
      <>
        <Text>generating api docs...</Text>
      </>
    );
  }
}
