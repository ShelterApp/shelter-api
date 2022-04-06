import { Profile, Strategy as InstagramStrategy } from 'passport-instagram';
import { UserRole, AccountProvider } from '@shelter/core';
import logger from '@shelter/core/dist/utils/logger';

import UserRepository from '../../../users/repository';
import AccountRepository from '../../../accounts/repository';

// tslint:disable-next-line:max-line-length
const authFunction = async (_, accessToken: string, refreshToken: string, profile: Profile, done: Function) => {
  try {
    logger.info('@Instagram Profile');
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
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails && profile.emails.length ? profile.emails[0].value : `${profile.id}@instagram.com`,
      gender: genders[profile.gender] || genders.female,
    };

    // tslint:disable-next-line:no-let
    let user = await UserRepository.getByEmail(providerUserProfile.email);

    if (!user) {
      user = await UserRepository.create({
        email: profile.emails[0].value,
        displayName: providerUserProfile.firstName ?
                    `${providerUserProfile.firstName} ${providerUserProfile.lastName}` :
                    providerUserProfile.lastName,
        roles: [UserRole.Default],
      });
    }

    // tslint:disable-next-line:no-let
    let account = await AccountRepository.findOne({
      provider: AccountProvider.Instagram,
      user: user.id,
    });

    if (!account) {
      account = await AccountRepository.create({
        user: user.id,
        provider: AccountProvider.Instagram,
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

export default new InstagramStrategy(
  {
    clientID: process.env.INSTAGRAM_CONSUMER_ID,
    clientSecret: process.env.INSTAGRAM_CONSUMER_SECRET,
    callbackURL: process.env.SHELTER_DOMAIN_URL + process.env.INSTAGRAM_CALLBACK_URL,
  },
  authFunction,
);
