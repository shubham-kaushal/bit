import * as path from 'path';
import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
  IExtractorConfigPrepareOptions,
  ExtractorLogLevel,
} from '@microsoft/api-extractor';

export const extractapi = (dtsFilePaths: any, outputFolder: string, componentPath: string, onOutput) => {
  const apiExtractorJsonPath: string = path.join(__dirname, '../config/api-extractor.json'); // Due to a Bug
  const componentName = path.basename(componentPath);
  const packageJsonFullPath = path.join(__dirname, '../config/_package.json'); // Due to a Bug

  // TODO output folter
  const apiJsonFilePath = path.join(outputFolder, componentName, `${componentName}.api.json`);
  const tsdocMetadataFilePath = path.join(outputFolder, componentName, `tsdoc-metadata.json`);

  // Load Api-Extractor configurations
  let configFile = ExtractorConfig.loadFile(apiExtractorJsonPath);
  configFile.mainEntryPointFilePath = dtsFilePaths;
  configFile.docModel.apiJsonFilePath = apiJsonFilePath;
  configFile.tsdocMetadata.tsdocMetadataFilePath = tsdocMetadataFilePath;

  // TODO after the api-extractor bug fixe - Configure messaging level.

  const extractorConfigPrepareOptions: IExtractorConfigPrepareOptions = {
    configObject: configFile,
    configObjectFullPath: apiExtractorJsonPath,
    packageJsonFullPath: packageJsonFullPath,
    projectFolderLookupToken: componentPath,
  };

  let extractorConfig: ExtractorConfig = ExtractorConfig.prepare(extractorConfigPrepareOptions);

  // Invoke API Extractor
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: false,
  });

  if (extractorResult.succeeded) {
    onOutput(null, `API Extractor completed successfully`);
  } else {
    const msg =
      `API Extractor completed with ${extractorResult.errorCount} errors` +
      ` and ${extractorResult.warningCount} warnings`;
    onOutput(extractorResult, msg);
  }

  return {
    componentName,
    tsdocMetadataFilePath,
    apiJsonFilePath,
  };
};
