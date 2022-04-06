import * as yup from 'yup';
import { validateBody } from '@shelter/core/dist/utils/express';

const baseSchema = {
  content: yup.string().required(),
  file: yup.string().required(),
};
const validateCreate = validateBody(
  (v: any) => yup.object(baseSchema).noUnknown().validateSync(v),
);

const validateUpdate = validateBody(
  (v: any) => yup.object(baseSchema).noUnknown().validateSync(v),
);

export { validateCreate, validateUpdate };
