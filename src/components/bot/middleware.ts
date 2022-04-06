import * as yup from 'yup';
import { validateBody } from '@shelter/core/dist/utils/express';

const querySchema = {
  // query: yup.string().max(265).required(),
  query: yup.string().max(265).required(),
  location: yup.string(),
  coordinate: yup.string(),
  chatToken: yup.string().required(),
  userTimezone: yup.number().required(),
};

const validateQuery = validateBody(
  (v: any) => yup.object(querySchema).noUnknown().validateSync(v),
);

const queryHook = {
  responseId: yup.string().required(),
  session: yup.string().required(),
  queryResult: yup.mixed(),
};

const validateHook = validateBody(
  (v: any) => yup.object(queryHook).noUnknown().validateSync(v),
);

export { validateQuery, validateHook };
