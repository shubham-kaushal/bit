'use strict';

import fs from 'fs-extra';

const getFileLines = (path: string) => {
  const lines = fs.readFileSync(path, 'utf-8').split('\n');
  // .filter(Boolean);
  return lines;
};

const replaceFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
};

const getInvalidSubstring = (line) => {
  const start = line.indexOf('import("');
  const end = line.indexOf('").') + '").'.length;
  const invalidImportStatement = line.substring(start, end);
  return invalidImportStatement;
};

const fixedOrReturnLine = (line) => {
  const lineCopy = line.repeat(1);
  if (!lineCopy.includes('import("')) {
    return lineCopy;
  }
  const invalidImportStatement = getInvalidSubstring(lineCopy);
  const fixedLine = lineCopy.replace(invalidImportStatement, '');
  return fixedLine;
};

const isValidLine = (line) => {
  return !line.includes('import("');
};

const getLibName = (line) => {
  const start = line.indexOf('import("') + 'import("'.length;
  const end = line.indexOf('").');
  const libName = line.substring(start, end);
  return libName;
};

const getFirstNonAlphaIndex = (str, startIndex) => {
  const index = str.substring(startIndex).search(/[^A-Za-z]/);
  return index;
};

const getExportName = (line) => {
  const start = line.indexOf('").') + '").'.length;
  const end = getFirstNonAlphaIndex(line, start);
  const exportName = line.substring(start, start + end);
  return exportName;
};

const getAdditionalLine = (line) => {
  const exportName = getExportName(line);
  const lib = getLibName(line);
  return `import { ${exportName} } from '${lib}';`;
};

const splettLines = (linesArray) => ({
  openLines: linesArray.filter((line) => line.startsWith('/// <')),
  closingLines: linesArray.filter((line) => !line.startsWith('/// <')),
});

const mergeLines = (properLines, additionalLines) => {
  const splitedLines = splettLines(properLines);
  return [...splitedLines.openLines, ...additionalLines, ...splitedLines.closingLines];
};

export const fixeDSTfile = (filePath: string) => {
  const lines = getFileLines(filePath);
  const properLines = lines.map((line) => fixedOrReturnLine(line));
  const additionalLines = lines.filter((line) => !isValidLine(line)).map((line) => getAdditionalLine(line));

  replaceFile(filePath, mergeLines(properLines, additionalLines).join('\n'));
};
