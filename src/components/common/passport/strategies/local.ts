import { Strategy } from 'passport-local';
import logger from '@shelter/core/dist/utils/logger';

import AccountRepository from '../../../accounts/repository';
import UserRepository from '../../../users/repository';

const authFunction = async (email: string, password: string, done: Function) => {
  try {
    const account = await AccountRepository.authenticateLocal(email, password);

    if (!account) {
      return done('Email or password invalid', false);
    }

    const user = await UserRepository.get(account.user.toString());

    if (user) {
      // * Update login time
      UserRepository.updateLastLoginTimestamp(user.id);

      return done(null, user);
    }

    return done({ message: 'Email or Password incorrect' }, false);
  } catch (err) {
    logger.error(err);
    return done(err.message, false);
  }
};

export default new Strategy(
  {
    emailField: 'email',
    passwordField: 'password', // tslint:disable-line: no-hardcoded-credentials
  },
  authFunction,
);
