import { OAuth2Strategy } from 'passport-google-oauth';
import { UserRole, AccountProvider } from '@shelter/core';
import logger from '@shelter/core/dist/utils/logger';

import UserRepository from '../../../users/repository';
import AccountRepository from '../../../accounts/repository';

// tslint:disable-next-line:max-line-length
const authFunction = async (_, accessToken: string, refreshToken: string, profile: any, done: Function) => {
  try {
    logger.info('@Google Profile');
    logger.info(profile);
    const providerData = profile._json;
    // tslint:disable-next-line:no-object-mutation
    providerData.accessToken = accessToken;
    // tslint:disable-next-line:no-object-mutation
    providerData.refreshToken = refreshToken;

    // * Create the user OAuth profile
    const providerUserProfile = {
      providerData,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      displayName: profile.displayName,
      email: profile.emails && profile.emails.length ? profile.emails[0].value : `${profile.id}@gmail.com`,
      username: profile.username,
      id: profile.id,
      providerIdentifierField: 'id',
    };

    // tslint:disable-next-line:no-let
    let user = await UserRepository.getByEmail(providerUserProfile.email);

    if (!user) {
      user = await UserRepository.create({
        email: profile.emails && profile.emails.length ? profile.emails[0].value : `${profile.id}@gmail.com`,
        displayName: profile.displayName,
        roles: [UserRole.Default],
      });
    }

    // tslint:disable-next-line:no-let
    let account = await AccountRepository.findOne({
      provider: AccountProvider.Google,
      user: user.id,
    });

    if (!account) {
      account = await AccountRepository.create({
        user: user.id,
        provider: AccountProvider.Google,
        credentials: providerUserProfile,
      });
    }

    // * Update account
    await AccountRepository.update({
      id: account.id,
      credentials: providerUserProfile,
    });

    return done(null, user);
  } catch (err) {
    logger.error(err);
    return done(err.message, false);
  }
};

export default new OAuth2Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.SHELTER_DOMAIN_URL + process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
  },
  authFunction,
);
