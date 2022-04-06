import mongoose from 'mongoose';
import db from '@shelter/core/dist/utils/db';
import errorHandler from '@shelter/core/dist/utils/error-handler';
import logger from '@shelter/core/dist/utils/logger';

// declare env vars
const host = process.env.HOST || 'localhost';
const port = +process.env.PORT || 9000;

// connect db
db.connect({
  mongoose,
  options: { timestampsPlugin: true },
  cb: async () => {
    // init data
    await require('./init-data').default();

    // start app
    require('./app')
    .default({ mongooseConnection: mongoose.connection }).listen(port, host, (err: Error) => {
      if (err) {
        throw err;
      }

      logger.info(`> App started at http://${host}:${port}`);
    });
  },
});

// handle unhandled promise
process.on('unhandledRejection', (err: Error) => {
  throw err;
});

// handle uncaught error and gracefully shutdown
process.on('uncaughtException', (err: Error) => {
  errorHandler.handle(err);
});

const connection = mongoose.connection;

export {
  connection,
};
