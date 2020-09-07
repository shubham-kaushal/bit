import { readdir, readdirSync } from 'fs-extra';
import assert from 'assert';

import './hook-require';

import { AspectAspect } from '@teambit/aspect';
import AspectLoaderAspect from '@teambit/aspect-loader';
import { BuilderAspect } from '@teambit/builder';
import { BundlerAspect } from '@teambit/bundler';
import { CacheAspect } from '@teambit/cache';
import { CLIAspect } from '@teambit/cli';
import { CompilerAspect } from '@teambit/compiler';
import { ComponentAspect } from '@teambit/component';
import { CompositionsAspect } from '@teambit/compositions';
import { ConfigAspect } from '@teambit/config';
import { DependencyResolverAspect } from '@teambit/dependency-resolver';
import { DeprecationAspect } from '@teambit/deprecation';
import { DocsAspect } from '@teambit/docs';
import { EnvsAspect } from '@teambit/environments';
import { ExpressAspect } from '@teambit/express';
import { FlowsAspect } from '@teambit/flows';
import { CreateAspect } from '@teambit/generator';
import { GraphAspect } from '@teambit/graph';
import { GraphqlAspect } from '@teambit/graphql';
import { InsightsAspect } from '@teambit/insights';
import { IsolatorAspect } from '@teambit/isolator';
import { JestAspect } from '@teambit/jest';
import { LoggerAspect } from '@teambit/logger';
import { NodeAspect } from '@teambit/node';
import { NotificationsAspect } from '@teambit/notifications';
import { PanelUiAspect } from '@teambit/panels';
import { PkgAspect } from '@teambit/pkg';
import { PnpmAspect } from '@teambit/pnpm';
import { PreviewAspect } from '@teambit/preview';
import { ReactAspect } from '@teambit/react';
import { ReactRouterAspect } from '@teambit/react-router';
import { SchemaAspect } from '@teambit/schema';
import { ScopeAspect } from '@teambit/scope';
import { StencilAspect } from '@teambit/stencil';
import { TesterAspect } from '@teambit/tester';
import { TypescriptAspect } from '@teambit/typescript';
import { UIAspect } from '@teambit/ui';
import { VariantsAspect } from '@teambit/variants';
import { WebpackAspect } from '@teambit/webpack';
import { WorkspaceAspect } from '@teambit/workspace';
import { ChangelogAspect } from '@teambit/changelog';
import { BitAspect } from './bit.aspect';

export const manifestsMap = {
  [AspectLoaderAspect.id]: AspectLoaderAspect,
  [CLIAspect.id]: CLIAspect,
  [WorkspaceAspect.id]: WorkspaceAspect,
  [CompilerAspect.id]: CompilerAspect,
  [ComponentAspect.id]: ComponentAspect,
  [PreviewAspect.id]: PreviewAspect,
  [DocsAspect.id]: DocsAspect,
  [CompositionsAspect.id]: CompositionsAspect,
  [GraphqlAspect.id]: GraphqlAspect,
  [PnpmAspect.id]: PnpmAspect,
  [UIAspect.id]: UIAspect,
  [CreateAspect.id]: CreateAspect,
  [EnvsAspect.id]: EnvsAspect,
  [FlowsAspect.id]: FlowsAspect,
  [GraphAspect.id]: GraphAspect,
  [DependencyResolverAspect.id]: DependencyResolverAspect,
  [InsightsAspect.id]: InsightsAspect,
  [IsolatorAspect.id]: IsolatorAspect,
  [LoggerAspect.id]: LoggerAspect,
  [PkgAspect.id]: PkgAspect,
  [ReactAspect.id]: ReactAspect,
  [StencilAspect.id]: StencilAspect,
  [ScopeAspect.id]: ScopeAspect,
  [TesterAspect.id]: TesterAspect,
  [BuilderAspect.id]: BuilderAspect,
  [VariantsAspect.id]: VariantsAspect,
  [DeprecationAspect.id]: DeprecationAspect,
  [ExpressAspect.id]: ExpressAspect,
  [AspectAspect.id]: AspectAspect,
  [WebpackAspect.id]: WebpackAspect,
  [SchemaAspect.id]: SchemaAspect,
  [ReactRouterAspect.id]: ReactRouterAspect,
  [PanelUiAspect.id]: PanelUiAspect,
  [TypescriptAspect.id]: TypescriptAspect,
  [NodeAspect.id]: NodeAspect,
  [NotificationsAspect.id]: NotificationsAspect,
  [BundlerAspect.id]: BundlerAspect,
  [JestAspect.id]: JestAspect,
  [CacheAspect.id]: CacheAspect,
  [ChangelogAspect.id]: ChangelogAspect,
};
// /Users/uritalyosef/Desktop/BIT/HarminyBit/bit/node_modules/@teambit/
// const dirPath = '../node_modules/@teambit';
const dirPath = '/Users/uritalyosef/Desktop/BIT/HarminyBit/bit/node_modules/@teambit';
// const dirPath = '../';
const files = readdirSync(dirPath);
// console.log('--> ', files)
// const runtimeFile = files.find((file) => file.includes(`.${runtime}.runtime.js`)) || null;
// this.constructor._load(path, this);

// const boot = () => {

/*
  export async function requireAspects(aspect: Extension, runtime: RuntimeDefinition) {
  const id = aspect.name;
  if (!id) throw new Error('could not retrieve aspect id');
  const dirPath = getAspectDir(id);
  const files = await readdir(dirPath);
  const runtimeFile = files.find((file) => file.includes(`.${runtime.name}.runtime.js`));
  if (!runtimeFile) return;
  // eslint-disable-next-line
  require(resolve(`${dirPath}/${runtimeFile}`));
}

const bitAspect filter

*/

const bitAspectFilter = (aspectPath) => {
  const files = readdirSync(aspectPath);
  const aspectName = aspectPath.split('/').pop();
  return !!files.find((file) => file.includes(`.${aspectName}.runtime.js`));
};

function boot() {
  console.log('---33---> ', bitAspectFilter(files[0]));

  return (
    files
      // .filter((file) => file.includes(`.${runtime.name}.runtime.js`)
      .filter((file) => bitAspectFilter(`${dirPath}/${file}`))
      .reduce((manifestsMap, aspectName) => {
        let path = `@teambit/${aspectName}`;
        // assert(typeof path === 'string', 'path must be a string');
        // assert(path, 'missing path');

        console.log('---2---> ', aspectName);

        if (path.includes('base-ui.constants.storage')) {
          return manifestsMap;
        }

        let aspect = require(path);
        // let aspect = constructor._load(path, this);
        // let aspect = this.constructor._load(path, this);
        // manifestsMap[aspect.id] = aspect;
        return manifestsMap;
      }, {})
  );
}

console.log('---->, ', boot());

export function isCoreAspect(id: string) {
  const _reserved = [BitAspect.id, ConfigAspect.id];
  if (_reserved.includes(id)) return true;
  return !!manifestsMap[id];
}

export function getAllCoreAspectsIds(): string[] {
  const _reserved = [BitAspect.id, ConfigAspect.id];
  return [...Object.keys(manifestsMap), ..._reserved];
}
