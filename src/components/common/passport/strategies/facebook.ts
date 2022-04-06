import { Profile, Strategy as FacebookStrategy } from 'passport-facebook';
import { UserRole, AccountProvider } from '@shelter/core';
import logger from '@shelter/core/dist/utils/logger';

import UserRepository from '../../../users/repository';
import AccountRepository from '../../../accounts/repository';

// tslint:disable-next-line:max-line-length
const authFunction = async (_, accessToken: string, refreshToken: string, profile: Profile, done: Function) => {
  try {
    logger.info('@Facebook Profile');
    logger.info(profile);
    const providerData = profile._json;
    // tslint:disable-next-line:no-object-mutation
    providerData.accessToken = accessToken;
    // tslint:disable-next-line:no-object-mutation
    providerData.refreshToken = refreshToken;

    const genders = {
      male: 'M',
      female: 'F',
    };

    // * Create the user OAuth profile
    const providerUserProfile = {
      providerData,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails && profile.emails.length ? profile.emails[0].value : `${profile.id}@facebook.com`,
      gender: genders[profile.gender] || genders.female,
    };

    // tslint:disable-next-line:no-let
    let user = await UserRepository.getByEmail(providerUserProfile.email);

    if (!user) {
      user = await UserRepository.create({
        email: profile.emails && profile.emails.length ? profile.emails[0].value : `${profile.id}@facebook.com`,
        displayName: providerUserProfile.firstName ?
                    `${providerUserProfile.firstName} ${providerUserProfile.lastName}` :
                    providerUserProfile.lastName,
        roles: [UserRole.Default],
      });
    }

    // tslint:disable-next-line:no-let
    let account = await AccountRepository.findOne({
      provider: AccountProvider.Facebook,
      user: user.id,
    });

    if (!account) {
      account = await AccountRepository.create({
        user: user.id,
        provider: AccountProvider.Facebook,
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

export default new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.SHELTER_DOMAIN_URL + process.env.FACEBOOK_CALLBACK_URL,
    passReqToCallback: true,
    profileFields: ['id', 'name', 'email'],
    enableProof: true,
  },
  authFunction,
);
