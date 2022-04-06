import express from 'express';
import morgan from 'morgan';
// import session from 'express-session';
// import mongoStore from 'connect-mongo';
import bodyParser from 'body-parser';
import cors from 'cors';
import { isDev } from '@shelter/core/dist/utils';
import { handleNotFound, handleErrors } from '@shelter/core/dist/utils/express';

import routes from './routes';
import passport from './components/common/passport';

const startApp = () => {
  // initialize app
  const app = express();
  const dev = isDev();
  // const MongoStore = mongoStore(session);

  // plug middleware
  app.use(morgan(dev ? 'dev' : 'common'));
  // app.use(session({
  //   name: 'shelter-app.sid',
  //   secret: 'shelter-app.uk',
  //   resave: false,
  //   saveUninitialized: true,
  //   store: new MongoStore({ mongooseConnection }),
  //   proxy: true,
  //   cookie: {
  //     maxAge: 30 * 24 * 60 * 60 * 1000,    // 30 days
  //   },
  // }));
  app.use(passport.initialize());
  // app.use(passport.session());
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
  }));
  app.use(bodyParser.json({
    limit: '50mb',
  }));

  app.use(cors());

  // app.use(cors());

  // plug routes
  app.use(routes({ dev }));
  // handle errors
  app.use(handleNotFound);
  app.use(handleErrors);

  return app;
};

export default startApp;
