import React from 'react';
import { ThemeContext } from '@teambit/documenter.theme.theme-context';
import { LinkedHeading } from '@teambit/documenter.ui.linked-heading';
import { Section } from '@teambit/documenter.ui.section';
import { Paragraph } from '@teambit/documenter.ui.paragraph';
import { List } from '@teambit/documenter.ui.list';
import { Separator } from '@teambit/documenter.ui.separator';
import { HighlightedText } from '@teambit/documenter.ui.highlighted-text';
import { PropTable } from '@teambit/documenter.ui.property-table';
// import { CodeSnippet } from '@teambit/documenter.ui.code-snippet';

import ReactJson from 'react-json-view';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { workspaceEx, workspaceProps } from './code-snippets';

export const abstract = 'An enviornment for React components';

export default () => {
  return (
    <ThemeContext>
      <>
        <Section>
          <LinkedHeading link="introduction">Introduction</LinkedHeading>
          <Paragraph>
            The React aspect (environment) "ties together" various aspects that relate to the lifecycle of a React
            component in a Bit workspace. It spares you the overhead of setting up your own environment and creates a
            standardized environment for your team.
          </Paragraph>
          <Paragraph>
            The React enviornment can be configured via the workspace.json. It can also be extended by consuming it and
            invoking its 'override' functions in your own custom enviornment extension.
          </Paragraph>
          <Separator />
        </Section>
        <Section>
          <LinkedHeading link="ws-config">Workspace Configuration</LinkedHeading>
          <Paragraph>The React aspect can be configured via the workspace.json, on two levels:</Paragraph>
          <List element="ol">
            {[
              <>
                <HighlightedText>root</HighlightedText> sets the default confugirations for the entire workspace
              </>,
              <>
                <HighlightedText>teambit.bit/variants</HighlightedText> sets the configurations to a limited set of
                components, selected by their common directory
              </>,
            ]}
          </List>
          <LinkedHeading link="example" size="xs">
            Example
          </LinkedHeading>
          <ReactJson
            src={workspaceEx}
            theme="monokai"
            collapsed={true}
            style={{ borderRadius: '5px', padding: '15px' }}
          />
          <PropTable rows={workspaceProps} />

          <Separator />
        </Section>
        <Section>
          <LinkedHeading link="ws-config">Workspace Configuration</LinkedHeading>
          <Paragraph>ws config...</Paragraph>

          <Separator />
        </Section>
      </>
    </ThemeContext>
  );
};
