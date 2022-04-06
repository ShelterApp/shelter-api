import * as yup from 'yup';
import { validateBody } from '@shelter/core/dist/utils/express';

const baseSchema = {
  name: yup.string().required(),
  description: yup.string().required(),
  area: yup.string().required(),
  chatWebLink: yup.string(),
  time: yup.string().required(),
  phone: yup.string().required(),
  text: yup.string(),
  website: yup.string(),
};
const validateCreate = validateBody(
  (v: any) => yup.object(baseSchema).noUnknown().validateSync(v),
);

const validateUpdate = validateBody(
  (v: any) => yup.object(baseSchema).noUnknown().validateSync(v),
);

export { validateCreate, validateUpdate };
