import { MainRuntime } from '@teambit/cli';
import { SchemaExtractorAspect } from './schema-extractor.aspect';

/**
 * extension for extracting component schemas.
 */
export class SchemaExtractorMain {
  constructor() {}

  static runtime = MainRuntime;

  static async provider() {
    return new SchemaExtractorMain();
  }
}

SchemaExtractorAspect.addRuntime(SchemaExtractorMain);
