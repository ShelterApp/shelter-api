import passportJWT from 'passport-jwt';
import logger from '@shelter/core/dist/utils/logger';

import UserRepository from '../../../users/repository';

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_TOKEN_SECRET,
}

export default new JwtStrategy(jwtOptions, async(jwt_payload, done: Function) => {
  try {

    // usually this would be a database call:
    const user = await UserRepository.get(jwt_payload.id);

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    logger.error(err);
    return done(err.message, false);
  }
});
