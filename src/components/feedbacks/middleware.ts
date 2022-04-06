import * as yup from 'yup';
import { validateBody } from '@shelter/core/dist/utils/express';

const validateCreateServiceFeedbackSchema = {
  email: yup.string().email().trim().lowercase(),
  name: yup.string().required(),
  service: yup.string().required(),
  subject: yup.string().required(),
  message: yup.string().required(),
  phone: yup.string(),
  files: yup.array(yup.object({
    fileName: yup.string().required(),
    type: yup.string().required(),
    size: yup.string().required(),
    content: yup.string().required(),
    contentType: yup.string().required(),
  })),
  coordinates: yup.string(),
};
const validateCreateServiceFeedback = validateBody(
  (v: any) => yup
  .object(validateCreateServiceFeedbackSchema)
  .test('at-least-one-value', 'email or phone is required', value => !!(value.email || value.phone))
  .noUnknown().validateSync(v),
);

const validateCreateAppFeedbackSchema = {
  email: yup.string().email().required().trim().lowercase(),
  subject: yup.string().required(),
  message: yup.string().required(),
  coordinates: yup.string(),
};
const validateCreateAppFeedback = validateBody(
  (v: any) => yup.object(validateCreateAppFeedbackSchema).noUnknown().validateSync(v),
);

export { validateCreateServiceFeedback, validateCreateAppFeedback };
