import { Router } from 'express';
import { NAME } from './constants';
import {
  validateSignInLocal, validateSignUpLocal, validateCreatePassword,
  validateUpdateProfile,
  authenticate,
  validateUpdatePassword,
  validateRequestResetPassword,
  validateFavoriteService,
  validateVerifyAccessToken,
  validateRegisterDevice,
} from './middleware';
import { signUpLocal, signInLocal, signOut, oauthCallback,
  createPassword, getLoggedUser, updateProfile, requestResetPassword,
  verifyAccessToken, addFavoriteService, removeFavoriteService, registerDevice, delDevice,
  reportNotifications, deeplinkResetPassword,
  login,
  updatePassword,
  } from './controller';

import { RoutesProps } from '../types';
import passport from '../common/passport';

const path = `/${NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.route('/sign-up')
    .post(validateSignUpLocal, signUpLocal);

  router.route('/sign-in')
    // .post(validateSignInLocal, signInLocal(passport))
    .post(validateSignInLocal, signInLocal)
    .delete(signOut);

  router.route('/login')
    .post(validateSignInLocal, login)

  router.route('/request-reset-password')
    .post(validateRequestResetPassword, requestResetPassword);

  router.route('/password')
    .post(validateCreatePassword, createPassword)
    .put(authenticate, validateUpdatePassword, updatePassword);

  router.route('/get-logged-user')
    .get(authenticate, getLoggedUser);

  router.route('/profile')
    // .get(authenticate, getLoggedUser)
    .get(authenticate, getLoggedUser)
    .put(authenticate, validateUpdateProfile, updateProfile);

  router.route('/add-favorite-service')
    .post(authenticate, validateFavoriteService, addFavoriteService);

  router.route('/remove-favorite-service')
    .post(authenticate, validateFavoriteService, removeFavoriteService);

  router.route('/register-device')
    .post(authenticate, validateRegisterDevice, registerDevice);
  router.route('/remove-device')
    .post(authenticate, validateRegisterDevice, delDevice);

  router.route('/report-notifications')
    .post(authenticate, reportNotifications);

  router.route('/deeplink')
    .get(deeplinkResetPassword);

  // * Social Login
  // * Google
  router.route('/google').get(passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  }));
  router.route('/google/callback').get(oauthCallback('google', passport));

  router.route('/verify-access-token')
    .post(validateVerifyAccessToken, verifyAccessToken);

  // * Facebook
  router.route('/facebook').get(passport.authenticate('facebook', {
    scope: [
      'email',
    ],
  }));
  router.route('/facebook/callback').get(oauthCallback('facebook', passport));

  // * Twitter
  router.route('/twitter').get(passport.authenticate('twitter', {
    scope: [
      'email',
    ],
  }));
  router.route('/twitter/callback').get(oauthCallback('twitter', passport));

  // * Instagram
  router.route('/instagram').get((_, res) => {
    res.redirect(`https://api.instagram.com/oauth/authorize?app_id=${process.env.INSTAGRAM_CONSUMER_ID}&redirect_uri=${process.env.SHELTER_DOMAIN_URL}${process.env.INSTAGRAM_CALLBACK_URL}&scope=user_profile,user_media&response_type=code`);
  });
  router.route('/instagram/callback').get(oauthCallback('instagram', passport));

  return router;
};

export default { path, routes };
