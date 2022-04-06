import { FeedbackType } from '@shelter/core/dist';

const NAME = 'feedback';
const PLURAL_NAME = 'feedbacks';

// tslint:disable-next-line: readonly-array
const FEEDBACK_TYPE = [
  FeedbackType.Service,
  FeedbackType.App,
];

export {
  NAME, PLURAL_NAME,
  FEEDBACK_TYPE,
};
