import { Profile, Strategy as TwitterStrategy } from 'passport-twitter';
import { UserRole, AccountProvider } from '@shelter/core';
import logger from '@shelter/core/dist/utils/logger';

import UserRepository from '../../../users/repository';
import AccountRepository from '../../../accounts/repository';

// tslint:disable-next-line:max-line-length
const authFunction = async (_, accessToken: string, refreshToken: string, profile: Profile, done: Function) => {
  try {
    logger.info('@Twitter Profile');
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
      username: profile.username,
      displayName: profile.displayName,
      email: profile.emails && profile.emails.length ? profile.emails[0].value : `${profile.id}@twitter.com`,
      gender: genders[profile.gender] || genders.female,
      id: profile.id,
      providerIdentifierField: 'id',
    };

    // tslint:disable-next-line:no-let
    let user = await UserRepository.getByEmail(providerUserProfile.email);

    if (!user) {
      user = await UserRepository.create({
        email: profile.emails && profile.emails.length ? profile.emails[0].value : `${profile.id}@twitter.com`,
        displayName: providerUserProfile.displayName
                  ? providerUserProfile.displayName : providerUserProfile.username,
        roles: [UserRole.Default],
      });
    }

    // tslint:disable-next-line:no-let
    let account = await AccountRepository.findOne({
      provider: AccountProvider.Twitter,
      user: user.id,
    });

    if (!account) {
      account = await AccountRepository.create({
        user: user.id,
        provider: AccountProvider.Twitter,
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

export default new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_CONSUMER_ID,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.SHELTER_DOMAIN_URL + process.env.TWITTER_CALLBACK_URL,
    userProfileURL  : 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
    passReqToCallback : true,
  },
  authFunction,
);
