import { MainRuntime } from '@teambit/cli';

import { ApiExtractorAspect } from './api-extractor.aspect';

export class ApiExtractorMain {
  public getRawMetadata(path: string) {
    return path;
  }

  static runtime = MainRuntime;

  static async provider() {
    return new ApiExtractorMain();
  }
}

ApiExtractorAspect.addRuntime(ApiExtractorMain);
