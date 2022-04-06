import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { INTERNAL_SERVER_ERROR, UNAUTHORIZED, NOT_FOUND, OK,
  NO_CONTENT, CONFLICT, BAD_REQUEST } from 'http-status-codes';
import { User, UserRole, AccountProvider, RequestPasswordType, ServiceType } from '@shelter/core';
import { HttpError } from '@shelter/core/dist/utils/error';
import { ListQuery, Query } from '@shelter/core/dist/utils/express';
import logger from '@shelter/core/dist/utils/logger';
import jwt from 'jsonwebtoken';

import UserRepository from '../users/repository';
import ServiceRepository from '../services/repository';
import AccountRepository from '../accounts/repository';
import FeedbackRepository from '../feedbacks/repository';
import * as EmailService from '../common/gmail';
import { LOCAL_USERNAME_PATH } from '../accounts/constants';
import * as GoogleApi from '../common/google';
import * as FacebookApi from '../common/facebook';
import * as InstagramApi from '../common/instagram';
import * as TwitterApi from '../common/twitter';

import {
  AUTH_SIGNUP_ADMIN,
} from '../templates/constants';

import { sendMessageToAdminGroup } from '../common/push-notifications';

type Request = ExpressRequest & {
  readonly myQuery: ListQuery | Query,
  readonly myBody: any;
  readonly login: any;
  readonly logout: any;
  readonly user: User;
};

// * Disable auto login for auth when user create password with type REGISTER
// const AUTO_LOGIN = false;
const LOGIN_FAILED_MESSAGE = 'Login Failed';

const signUpLocal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName, phone } = req.myBody;

    // Check the user existed
    const existedUser = await UserRepository.getByEmail(email);

    if (existedUser) {
      next(new HttpError(CONFLICT, 'Email already exists'));

      return;
    }

    const user = await UserRepository.create({
      email,
      displayName,
      phone,
      roles: [UserRole.Default],
      lastMethod: AccountProvider.Local,
    });

    await AccountRepository.create({
      user: user.id,
      credentials: {
        email,
        password,
      },
    });

    // * Send email
    EmailService.sendWelcome({
      email,
    });

    // * Update login time
    UserRepository.updateLastLoginTimestamp(user.id);

    // * Send notification
    sendMessageToAdminGroup(AUTH_SIGNUP_ADMIN, {
      providerName: displayName || email,
    });

    const token = jwt.sign({
      id: user.id,
    }, process.env.JWT_TOKEN_SECRET);
    res.json({
      ...user,
      token,
    });

    // req.login(user, (err) => {
    //   if (err) {
    //     next(new HttpError(UNAUTHORIZED, LOGIN_FAILED_MESSAGE));

    //     return;
    //   }

    //   // * Update login time
    //   UserRepository.updateLastLoginTimestamp(user.id);

    //   // * Send notification
    //   sendMessageToAdminGroup(AUTH_SIGNUP_ADMIN, {
    //     providerName: displayName || email,
    //   });

    //   res.send(user);
    // });
  } catch (err) {
    if (err.code) {
      next(new HttpError(err.code, err.message));

      return;
    }
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const signInLocal = async (req: Request, res: Response, next: NextFunction) => {
  // tslint:disable-next-line:no-object-mutation
  // req.myBody.username = req.myBody.email;
  // passport.authenticate('local', async (err: Error, user: User) => {
  //   if (err) {
  //     next(new HttpError(UNAUTHORIZED, err));

  //     return;
  //   }

  //   // tslint:disable-next-line: no-identical-functions
  //   req.login(user, (err) => {
  //     if (err) {
  //       next(new HttpError(UNAUTHORIZED, LOGIN_FAILED_MESSAGE));

  //       // * Update login time
  //       UserRepository.updateLastLoginTimestamp(user.id);

  //       return;
  //     }

  //     res.send(user);
  //   });
  // })(req, res, next);
  try {
    const { email, password } = req.myBody;
  
    const account = await AccountRepository.authenticateLocal(email, password);

    if (!account) {
      next(new HttpError(BAD_REQUEST, 'Email or password invalid'));
      return;
    }

    const user = await UserRepository.get(account.user.toString());

    if (!user) {
      // * Update login time
      next(new HttpError(BAD_REQUEST, 'Email or password invalid'));
      return;
    }

    // * OK
    UserRepository.updateLastLoginTimestamp(user.id);

    const token = jwt.sign({
      id: user.id,
    }, process.env.JWT_TOKEN_SECRET);
    res.json({
      ...user,
      token,
    });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.myBody;
  
    const account = await AccountRepository.authenticateLocal(email, password);

    if (!account) {
      next(new HttpError(BAD_REQUEST, 'Email or password invalid'));
      return;
    }

    const user = await UserRepository.get(account.user.toString());

    if (!user) {
      // * Update login time
      next(new HttpError(BAD_REQUEST, 'Email or password invalid'));
      return;
    }

    // * OK
    UserRepository.updateLastLoginTimestamp(user.id);

    const token = jwt.sign({
      id: user.id,
    }, process.env.JWT_TOKEN_SECRET);
    res.json({
      ...user,
      token,
    });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, accessToken, email, displayName, phone, accessTokenSecret } = req.myBody;
    // tslint:disable-next-line:no-let
    let isVerified = false;
    // tslint:disable-next-line:no-let
    let providerUserProfile;
    switch (type) {
      case AccountProvider.Facebook: {
        providerUserProfile = await FacebookApi.verifyAccessToken(accessToken);
        if (providerUserProfile && providerUserProfile.id) {
          isVerified = true;
        }
        break;
      }
      case AccountProvider.Google: {
        providerUserProfile = await GoogleApi.verifyAccessToken(accessToken);
        if (providerUserProfile && providerUserProfile.user_id) {
          isVerified = true;
        }
        break;
      }
      case AccountProvider.Instagram: {
        providerUserProfile = await InstagramApi.verifyAccessToken(accessToken);
        if (providerUserProfile && providerUserProfile.id) {
          isVerified = true;
        }
        break;
      }
      case AccountProvider.Twitter: {
        providerUserProfile = await TwitterApi.verifyAccessToken(accessToken, accessTokenSecret);
        if (providerUserProfile && providerUserProfile.id) {
          isVerified = true;
        }
        break;
      }
    }

    if (!isVerified) {
      next(new HttpError(BAD_REQUEST, 'Token invalid'));

      return;
    }

    // tslint:disable-next-line:no-let
    let user = await UserRepository.getByEmail(email);

    if (!user) {
      user = await UserRepository.create({
        email,
        displayName,
        phone,
        roles: [UserRole.Default],
        lastMethod: type,
      });
    }

    providerUserProfile = {
      accessToken,
      displayName,
      email,
      ...providerUserProfile,
    };

    // tslint:disable-next-line:no-let
    let account = await AccountRepository.findOne({
      provider: type,
      user: user.id,
    });

    if (!account) {
      const existedAnotherAccount = await AccountRepository.findOne({
        user: user.id,
      });

      if (existedAnotherAccount) {
        next(new HttpError(BAD_REQUEST, `Sorry, looks like ${email} is already signed up using ${existedAnotherAccount.provider} account. Please try logging in using that account`));

        return;
      }

      account = await AccountRepository.create({
        user: user.id,
        provider: type,
        credentials: providerUserProfile,
      });

      // * Send welcome email
      if (email) {
        EmailService.sendWelcome({
          email,
        });
      }
    } else {
      // * Update account
      await AccountRepository.update({
        id: account.id,
        credentials: providerUserProfile,
      });
    }

    // * Update login time
    UserRepository.updateLastLoginTimestamp(user.id);
    
    const token = jwt.sign({
      id: user.id,
    }, process.env.JWT_TOKEN_SECRET);

    res.json({
      ...user,
      token,
    });

    // tslint:disable-next-line:no-identical-functions
    // req.login(user, (err) => {
    //   if (err) {
    //     next(new HttpError(UNAUTHORIZED, LOGIN_FAILED_MESSAGE));

    //     return;
    //   }

    //   // * Update login time
    //   UserRepository.updateLastLoginTimestamp(user.id);

    //   res.send(user);
    // });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const oauthCallback = (strategy: string, passport: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(strategy, (err: Error, user: User) => {
      if (err || !user) {
        logger.error(err);
        next(new HttpError(UNAUTHORIZED, LOGIN_FAILED_MESSAGE));

        return;
      }
      
      const token = jwt.sign({
        id: user.id,
      }, process.env.JWT_TOKEN_SECRET);
      res.json({
        ...user,
        token,
      });

      // req.login(user, (err) => {
      //   if (err) {
      //     logger.error(err);
      //     next(new HttpError(UNAUTHORIZED, LOGIN_FAILED_MESSAGE));

      //     return;
      //   }

      //   return res.json(user);
      // });
    })(req, res, next);
  };
};

const signOut = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new HttpError(UNAUTHORIZED, 'Unauthorized'));

    return;
  }

  req.logout();

  res.send({
    code: NO_CONTENT,
    message: 'No Content',
  });
};

const createPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, token } = req.myBody;

    const user = await UserRepository.getByEmail(email);

    if (!user) {
      next(new HttpError(NOT_FOUND, 'User not found'));

      return;
    }

    const account = await AccountRepository.findOne({
      [LOCAL_USERNAME_PATH]: email,
      provider: AccountProvider.Local,
    });

    if (!account) {
      next(new HttpError(NOT_FOUND, 'Account not found'));

      return;
    }

    if (token !== account.credentials.passwordToken) {
      next(new HttpError(BAD_REQUEST, 'Token invalid'));

      return;
    }

    if (new Date(account.credentials.passwordTokenExpires) < new Date()) {
      next(new HttpError(BAD_REQUEST, 'Token expired'));

      return;
    }

    await AccountRepository.changePassword(account.id, password);

    res.send(user);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const requestResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, type = RequestPasswordType.Default } = req.myBody;
    logger.info(type);

    const user = await UserRepository.getByEmail(email);

    if (!user) {
      next(new HttpError(NOT_FOUND, 'Email not found'));

      return;
    }

    // tslint:disable-next-line:no-let
    let account = await AccountRepository.findOne({
      [LOCAL_USERNAME_PATH]: email,
      provider: AccountProvider.Local,
    });

    if (!account) {
      account = await AccountRepository.create({
        user: user.id,
        credentials: {
          email,
          password: Math.random().toString(36).substring(6),
        },
        provider: AccountProvider.Local,
      });
    }

    // * Generate token for account
    account = await AccountRepository.generatePasswordToken(account.id);

    const webUrl = `https://shelter.app/auth/resetPassword?token=${account.credentials.passwordToken}&email=${email}`;
    
    const mobileUrl = `${process.env.SHELTER_MOBILE_PROTOCOL}://Auth/ResetPassword?token=${account.credentials.passwordToken}&email=${email}`;
    const deepLinkUrl = `https://shelter.app/auth/deeplink?url=${mobileUrl}`;

    const resetPasswordLink = type === RequestPasswordType.Mobile ? deepLinkUrl : webUrl;

    console.log('@resetPasswordLink', resetPasswordLink);

    // * Send email to account requested reset password
    await EmailService.sendResetPassword({
      email,
      resetPasswordLink,
    });

    res.send({
      code: OK,
      message: 'Sent an email to request reset password',
    });
  } catch (err) {
    if (err.code) {
      next(new HttpError(err.code, err.message));

      return;
    }
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.myBody;

    const account = await AccountRepository.authenticateLocal(req.user.email, oldPassword);

    if (!account) {
      next(new HttpError(BAD_REQUEST, 'Old password invalid'));

      return;
    }

    // * update new password
    await AccountRepository.changePassword(account.id, newPassword);

    res.send(req.user);
  } catch (err) {
    if (err.code) {
      next(new HttpError(err.code, err.message));

      return;
    }
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const getLoggedUser = async (req: Request, res: Response, _: NextFunction) => {
  res.send(req.user);
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserRepository.update({
      ...req.myBody,
      id: req.user.id,
    });

    res.send(user);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const addFavoriteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service }: { readonly service: string} = req.myBody;

    const favoriteServices: ReadonlyArray<string> = [
      ...new Set(
        [
          ...(req.user.favoriteServices as readonly string[]),
          service,
        ].map((service: string) => service.toString()),
      ),
    ];

    const object = await UserRepository.update({
      favoriteServices,
      id: req.user.id,
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const removeFavoriteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service }: { readonly service: string } = req.myBody;

    const favoriteServices: ReadonlyArray<string> = (req.user.favoriteServices as readonly string[])
                                .filter((serviceId: string) => serviceId.toString() !== service);

    const object = await UserRepository.update({
      favoriteServices,
      id: req.user.id,
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const registerDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, token, deviceId } = req.myBody;

    const { devices = [] } = req.user;

    const existedDevice = devices.find((device) => {
      return device.deviceId === deviceId;
    });

    const object = await UserRepository.update({
      id: req.user.id,
      devices: existedDevice ? devices.map((device) => {
        return device.deviceId === deviceId
        ? {
          ...device,
          token,
        } : device;
      }) : [
        ...devices,
        {
          platform,
          token,
          deviceId,
        },
      ],
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const delDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req.myBody;

    const { devices = [] } = req.user;

    const object = await UserRepository.update({
      id: req.user.id,
      devices: devices.filter((device) => {
        return device.deviceId !== deviceId;
      }),
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const reportNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user.roles.includes(UserRole.Administrator);
    const filterByUser = !isAdmin ? {
      user: req.user.id,
    } : {};
    const countManagedServices = await ServiceRepository.count({
      query: isAdmin ? {
        isApproved: true,
      } : {
        user: req.user.id,
      },
    } as unknown as ListQuery);

    const countManagedShelters = await ServiceRepository.count({
      query: {
        type: ServiceType.Shelter,
        $or: [{
          availableBeds: {
            $gt: 0,
          },
        }, {
          totalBeds: {
            $gt: 0,
          },
        }],
        ...filterByUser,
      },
    } as unknown as ListQuery);

    const countUnReadFeedbacks = await FeedbackRepository.count({
      query: isAdmin ? {
        isArchive: false,
      } : {
        isArchive: false,
        serviceOwner: req.user.id,
      },
    } as unknown as ListQuery);

    if (isAdmin) {
      const countNotApprovedServices = await ServiceRepository.count({
        query: {
          isApproved: false,
        },
      } as unknown as ListQuery);
      const countAdminUsers = await UserRepository.count({
        query: {
          roles: UserRole.Administrator,
        },
      } as unknown as ListQuery);

      const countSupperUsers = await UserRepository.count({
        query: {
          roles: UserRole.SupperUser,
        },
      } as unknown as ListQuery);

      const countTotalUsers = await UserRepository.count({} as unknown as ListQuery);

      res.send({
        countManagedServices,
        countUnReadFeedbacks,
        countManagedShelters,
        countNotApprovedServices,
        countAdminUsers,
        countSupperUsers,
        countTotalUsers,
      });
    } else {
      // * Normal user
      res.send({
        countManagedServices,
        countUnReadFeedbacks,
        countManagedShelters,
      });
    }
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const deeplinkResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, email } = req.query;
    const redirectUrl = `${url}&email=${email}`;
    logger.info('@redirectUrl', redirectUrl);

    res.redirect(redirectUrl);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

export {
  login,
  signUpLocal,
  signInLocal,
  verifyAccessToken,
  oauthCallback,
  signOut,
  createPassword,
  updatePassword,
  getLoggedUser,
  updateProfile,
  requestResetPassword,
  addFavoriteService,
  removeFavoriteService,
  registerDevice,
  delDevice,
  reportNotifications,
  deeplinkResetPassword,
};
