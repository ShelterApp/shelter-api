import * as yup from '../common/yup-custom';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { validateBody } from '@shelter/core/dist/utils/express';
import { INTERNAL_SERVER_ERROR, UNAUTHORIZED, FORBIDDEN } from 'http-status-codes';
import { HttpError } from '@shelter/core/dist/utils/error';
import { User } from '@shelter/core';
import { SOCIAL_LOGIN_TYPE, REQUEST_PASSWORD_TYPE, PLATFORM_TYPE } from './constants';
import passport from '../common/passport';

type Request = ExpressRequest & {
  user: User;
};

const signUpLocalSchema = {
  email: yup.string().email().required().trim().lowercase(),
  password: yup.string().trim().required().min(6),
  displayName: yup.string().required().min(3),
  phone: yup.string(),
};
const validateSignUpLocal = validateBody(
  (v: any) => yup.object(signUpLocalSchema).noUnknown().validateSync(v),
);

const signInLocalSchema = {
  email: yup.string().required().trim().lowercase(),
  password: yup.string().required().min(6),
};
const validateSignInLocal = validateBody(
  (v: any) => yup.object(signInLocalSchema).noUnknown().validateSync(v),
);

const requestResetPasswordSchema = {
  email: yup.string().email().required().trim().lowercase(),
  type: yup.string().oneOf(REQUEST_PASSWORD_TYPE),
};
const validateRequestResetPassword = validateBody(
  (v: any) => yup.object(requestResetPasswordSchema).noUnknown().validateSync(v),
);

const createPasswordSchema = {
  email: yup.string().email().required().trim().lowercase(),
  password: yup.string().trim().required().min(6),
  token: yup.string().trim().required(),
};

const validateCreatePassword = validateBody((v: any) => {
  return yup.object(createPasswordSchema).noUnknown().validateSync(v);
});

const updatePasswordSchema = {
  oldPassword: yup.string().trim().required().min(6),
  newPassword: yup.string().trim().required().min(6),
};

const validateUpdatePassword = validateBody((v: any) => {
  return yup.object(updatePasswordSchema).noUnknown().validateSync(v);
});

const updateProfileSchema = {
  displayName: yup.string().required().min(3),
  phone: yup.string(),
};
const validateUpdateProfile = validateBody(
  (v: any) => yup.object(updateProfileSchema).noUnknown().validateSync(v),
);

const favoriteServiceSchema = {
  service: yup.string().trim().required(),
};

const validateFavoriteService = validateBody((v: any) => {
  return yup.object(favoriteServiceSchema).noUnknown().validateSync(v);
});

const verifyAccessTokenSchema = {
  type: yup.string().oneOf(SOCIAL_LOGIN_TYPE).required(),
  accessToken: yup.string().required(),
  email: yup.string().email().required().trim().lowercase(),
  displayName: yup.string().required().min(3),
  phone: yup.string(),
  accessTokenSecret: yup.string().nullable(),
};

const validateVerifyAccessToken = validateBody((v: any) => {
  return yup.object(verifyAccessTokenSchema).noUnknown().validateSync(v);
});

const registerDeviceSchema = {
  platform: yup.string().oneOf(PLATFORM_TYPE).required(),
  token: yup.string().trim().required(),
  deviceId: yup.string().trim().required(),
};

const validateRegisterDevice = validateBody((v: any) => {
  return yup.object(registerDeviceSchema).noUnknown().validateSync(v);
});

// const authenticate = async (req: Request, _: Response, next: NextFunction) => {
//   try {
//     passport.authenticate('jwt', { session: false });

//     console.log('@data', data);

//     if (!req.user) {
//       next(new HttpError(UNAUTHORIZED, 'Unauthorized'));

//       return;
//     }

//     next();
//   } catch (err) {
//     next(new HttpError(INTERNAL_SERVER_ERROR, err));
//   }
// };

// const hasAuthorization = (requiredRoles: readonly string[]) => {
//   return (req: Request, _: Response, next: NextFunction) => {
//     try {
//       if (!req.user) {
//         next(new HttpError(UNAUTHORIZED, 'Unauthorized'));

//         return;
//       }

//       const roles = req.user.roles;

//       if (!roles.some(role => requiredRoles.includes(role))) {
//         next(new HttpError(FORBIDDEN, 'Forbidden'));

//         return;
//       }

//       next();
//     } catch (err) {
//       next(new HttpError(INTERNAL_SERVER_ERROR, err));
//     }
//   };
// };

const authenticate = passport.authenticate("jwt", {
  session: false,
});

const hasAuthorization = (requiredRoles: readonly string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      return passport.authenticate("jwt", {
        session: false,
      }, (err, user, _) => {
        if (err) {
          next(new HttpError(INTERNAL_SERVER_ERROR, err));
          return;
        }

        if (!user) {
          next(new HttpError(UNAUTHORIZED, 'Unauthorized'));

          return;
        }
        // Forward user information to the next middleware
        const roles = user.roles;

        if (!roles.some(role => requiredRoles.includes(role))) {
          next(new HttpError(FORBIDDEN, 'Forbidden'));
          return;
        }

        next();
    })(req, res, next);
    } catch (err) {
      next(new HttpError(INTERNAL_SERVER_ERROR, err));
    }
  };
};


export {
  validateSignUpLocal,
  validateSignInLocal,
  validateRequestResetPassword,
  validateCreatePassword,
  validateUpdatePassword,
  authenticate,
  validateUpdateProfile,
  validateFavoriteService,
  hasAuthorization,
  validateVerifyAccessToken,
  validateRegisterDevice,
};
