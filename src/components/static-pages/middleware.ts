import * as yup from 'yup';
import { validateBody } from '@shelter/core/dist/utils/express';

const baseSchema = {
  name: yup.string().required(),
  code: yup.string().required(),
  content: yup.string().required(),
};
const validateCreate = validateBody(
  (v: any) => yup.object(baseSchema).noUnknown().validateSync(v),
);

const updateSchema = {
  name: yup.string().required(),
  content: yup.string().required(),
};

const validateUpdate = validateBody(
  (v: any) => yup.object(updateSchema).noUnknown().validateSync(v),
);

export { validateCreate, validateUpdate };
