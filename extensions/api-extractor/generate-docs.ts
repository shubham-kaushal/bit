import * as tmp from 'tmp';
import * as path from 'path';

import { createDtsFile, extractApiFromComponentDTSFiles, fixeDTSfilesInDir } from './utils';

export const generateDocsForComponent = async (
  componentDirPath: string,
  outputDirPath: string,
  onOutput: (e, msg) => void,
  generateMarkdownReports: boolean
) => {
  // Creating temp folder
  const componentRootFileName = 'index.ts';
  const componentRootDTSFileName = 'index.d.ts';
  const componentsName = path.basename(componentDirPath);
  const tmpobj = tmp.dirSync({ prefix: 'dev.bit.docs.dts-', keep: false, unsafeCleanup: true });
  const tempDtsOutputFolder = path.join(tmpobj.name, '__tempDtsOutputFolder__', componentsName);

  try {
    // Creating DTS files
    const componentRootFilePath = path.join(componentDirPath, componentRootFileName);
    createDtsFile(componentRootFilePath, tempDtsOutputFolder, onOutput);

    // Aplay fixes to DTS files
    fixeDTSfilesInDir(tempDtsOutputFolder);

    // Extracting API from DTS files
    const rootDtsFilePaths = path.join(tempDtsOutputFolder, componentRootDTSFileName);
    const options = { rootDtsFilePaths, componentDirPath, outputDirPath, onOutput, generateMarkdownReports };
    const resultsLocation = await extractApiFromComponentDTSFiles(options);

    // Cleanup
    tmpobj.removeCallback();

    return resultsLocation;
  } catch (err) {
    tmpobj.removeCallback();
    throw err;
  }
};
