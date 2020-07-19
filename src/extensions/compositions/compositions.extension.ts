import { BundlerExtension } from '../bundler';
import { Component, ComponentFactoryExt } from '../component';
import { ExecutionContext } from '../environments';
import { ComponentMap } from '../component/component-map';
import { PreviewExtension } from '../preview/preview.extension';
import { Composition } from './composition';
import { compositionsSchema } from './compositions.graphql';
import { GraphQLExtension } from '../graphql';
import { AbstractVinyl } from '../../consumer/component/sources';
import { Workspace, WorkspaceExt } from '../workspace';
import { SchemaExtension } from '../schema';
import { ExtensionData } from '../workspace/on-component-load';

export type CompositionsConfig = {
  /**
   * regex for detection of composition files
   */
  extension: string;
};

/**
 * the component documentation extension.
 */
export class CompositionsExtension {
  static id = '@teambit/compositions';
  constructor(
    /**
     * envs extension.
     */
    private preview: PreviewExtension,

    /**
     * workspace extension.
     */
    private workspace: Workspace,

    /**
     * schema extension.
     */
    private schema: SchemaExtension
  ) {}

  /**
   * returns an array of doc file paths for a set of components.
   */
  getCompositionFiles(components: Component[]): ComponentMap<AbstractVinyl[]> {
    return ComponentMap.as<AbstractVinyl[]>(components, (component) => {
      return component.state.filesystem.byRegex(/composition.ts/);
    });
  }

  /**
   * get component compositions.
   */
  getCompositions(component: Component): Composition[] {
    const entry = component.state.config.extensions.findExtension(CompositionsExtension.id);
    if (!entry) return [];
    const compositions = entry.data.compositions;
    if (!compositions) return [];

    return Composition.fromArray(compositions);
  }

  /**
   * read composition from the component source code.
   */
  readCompositions(component: Component): Composition[] {
    const maybeFiles = this.getCompositionFiles([component]).byComponent(component);
    if (!maybeFiles) return [];
    const [, files] = maybeFiles;

    return files.flatMap((file) => {
      return this.computeCompositions(component, file);
    });
  }

  async compositionsPreviewTarget(context: ExecutionContext) {
    const compositionsMap = this.getCompositionFiles(context.components);
    const template = await this.getTemplate(context);
    const notEmpty = compositionsMap.filter((value) => value.length !== 0);
    const withPaths = notEmpty.map<string[]>((files) => {
      return files.map((file) => file.path);
    });

    const link = this.preview.writeLink(
      'compositions',
      withPaths.filter((value) => value.length !== 0),
      template
    );

    const targetFiles = compositionsMap.toArray().flatMap(([, files]) => {
      return files.map((file) => file.path);
    });

    return targetFiles.concat(link);
  }

  async onComponentLoad(component: Component): Promise<ExtensionData> {
    const compositions = this.readCompositions(component);
    return {
      compositions: compositions.map((composition) => composition.toObject()),
    };
  }

  private computeCompositions(component: Component, file: AbstractVinyl): Composition[] {
    // :TODO hacked for a specific file extension now until david will take care in the compiler.
    const pathArray = file.path.split('.');
    pathArray[pathArray.length - 1] = 'js';

    const module = this.schema.parseModule(file.path);
    return module.exports.map((exportModel) => {
      return new Composition(exportModel.identifier, file.relative);
    });
  }

  private async getTemplate(context: ExecutionContext) {
    return context.env.getMounter();
  }

  static dependencies = [
    BundlerExtension,
    PreviewExtension,
    GraphQLExtension,
    WorkspaceExt,
    SchemaExtension,
    ComponentFactoryExt,
  ];

  static async provider([bundler, preview, graphql, workspace, schema]: [
    BundlerExtension,
    PreviewExtension,
    GraphQLExtension,
    Workspace,
    SchemaExtension
  ]) {
    const compositions = new CompositionsExtension(preview, workspace, schema);

    graphql.register(compositionsSchema(compositions));
    bundler.registerTarget({
      entry: compositions.compositionsPreviewTarget.bind(compositions),
    });
    if (workspace) {
      workspace.onComponentLoad(compositions.onComponentLoad.bind(compositions));
    }

    return compositions;
  }
}
