import { Passport } from 'passport';
import { User } from '@shelter/core';
import UserRepository from '../../users/repository';

// import localStrategy from './strategies/local';
import jwtStrategy from './strategies/jwt';
import googleStrategy from './strategies/google';
import facebookStrategy from './strategies/facebook';
import twitterStrategy from './strategies/twitter';
import instagramStrategy from './strategies/instagram';

const passport = new Passport();

// passport.use(localStrategy);
passport.use(jwtStrategy);
passport.use(googleStrategy);
passport.use(facebookStrategy);
passport.use(twitterStrategy);
passport.use(instagramStrategy);

passport.serializeUser((user: User, done: Function) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await UserRepository.get(id);

  done(null, user);
});

export default passport;
