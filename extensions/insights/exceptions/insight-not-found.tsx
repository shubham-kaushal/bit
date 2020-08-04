import { PaperError } from '@teambit/cli';

export default class InsightNotFound extends PaperError {
  constructor(readonly insightName: string) {
    super(generateMessage(insightName));
  }
  report() {
    return this.message;
  }
}
function generateMessage(insightName: string) {
  return `Insight ${insightName} not found`;
}