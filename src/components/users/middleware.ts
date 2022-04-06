import * as yup from 'yup';
import { validateBody } from '@shelter/core/dist/utils/express';

import { USER_ROLES } from './constants';

const createSchema = {
  email: yup.string().trim().required(),
};

const validateCreate = validateBody((v: any) => {
  // strip out id
  return yup.object(createSchema).noUnknown().validateSync(v);
});

const updateSchema = {
  id: yup.string(),
  displayName: yup.string().trim().required(),
  phone: yup.string(),
  totalServices: yup.number().min(1),
};

const validateUpdate = validateBody((v: any) => {
  // strip out id
  const { id: _, ...rest } = yup.object(updateSchema).noUnknown().validateSync(v);

  return rest;
});

const createPasswordSchema = {
  password: yup.string().trim().required(),
  token: yup.string().trim().required(),
  displayName: yup.string(),
};

const validateCreatePassword = validateBody((v: any) => {
  return yup.object(createPasswordSchema).noUnknown().validateSync(v);
});

const updatePasswordSchema = {
  oldPassword: yup.string().trim().required(),
  newPassword: yup.string().trim().required(),
};

const validateUpdatePassword = validateBody((v: any) => {
  return yup.object(updatePasswordSchema).noUnknown().validateSync(v);
});

const checkCredentialsSchema = {
  email: yup.string().trim().required(),
  password: yup.string().trim().required(),
};

const favoriteEventSchema = {
  event: yup.string().trim().required(),
};

const validateFavoriteEvent = validateBody((v: any) => {
  return yup.object(favoriteEventSchema).noUnknown().validateSync(v);
});

const validateCheckCredentials = validateBody((v: any) => {
  return yup.object(checkCredentialsSchema).noUnknown().validateSync(v);
});

const createBulkSchema = {
  emails: yup.array(
    yup.string().required(),
  ).required(),
};

const validateCreateBulk = validateBody((v: any) => {
  return yup.object(createBulkSchema).noUnknown().validateSync(v);
});

const registerDeviceSchema = {
  platform: yup.string().oneOf([]).required(),
  token: yup.string().trim().required(),
  deviceId: yup.string().trim().required(),
};

const validateRegisterDevice = validateBody((v: any) => {
  return yup.object(registerDeviceSchema).noUnknown().validateSync(v);
});

const setPermissionSchema = {
  role: yup.string().oneOf(USER_ROLES as string[]).required(),
};
const validateSetPermission = validateBody(
  (v: any) => yup.object(setPermissionSchema).noUnknown().validateSync(v),
);

export {
  validateCreate,
  validateUpdate,
  validateCreatePassword,
  validateUpdatePassword,
  validateCheckCredentials,
  validateCreateBulk,
  validateFavoriteEvent,
  validateRegisterDevice,
  validateSetPermission,
};
