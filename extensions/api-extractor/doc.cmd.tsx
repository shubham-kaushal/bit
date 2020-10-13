/**
 * TODO[uri] - refactor to full blown React app (with state).
 */
import { Command, CommandOptions } from '@teambit/cli';
import { Logger } from '@teambit/logger';
import type { ApiExtractorMain } from '@teambit/api-extractor';
import { Workspace } from '@teambit/workspace';

import React from 'react';
import { render, Text } from 'ink';

export class DocCmd implements Command {
  name = 'doc [type] [pattern]';
  description = 'Generate documentation for all workspace or a specific component';
  alias = 'c';
  group = 'component';
  shortDescription = '';
  options = [
    ['p', 'path <file>/"<file>,<file>"', 'path to the root file'],
    ['v', 'verbose', 'showing verbose output for inspection and prints stack trace'],
    ['r', 'report <file>/"<file>,<file>"', 'markdown report output path'],
  ] as CommandOptions;

  constructor(
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
    { path, verbose, report }: { path: string; verbose: boolean; report: string }
  ): Promise<React.ReactElement> {
    this.logger.off();
    this.apiExtractor.generateDocsForWorkspace(this.gatOnOutput(!!verbose), report);

    return (
      <>
        <Text>generating api docs...</Text>
      </>
    );
  }
}
