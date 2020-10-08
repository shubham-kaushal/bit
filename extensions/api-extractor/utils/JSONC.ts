import * as fs from 'fs-extra';
import * as jsonc from 'comment-json';

export const requireJsonWithComments = (path: string) => {
  const jsonStr = fs.readFileSync(path, { encoding: 'utf8' });
  return jsonc.parse(jsonStr);
};
