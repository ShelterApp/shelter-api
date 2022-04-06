import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';
import mongoose from 'mongoose';
import { File } from '@shelter/core';
import { HttpError } from '@shelter/core/dist/utils/error';
import { ListQuery, Query } from '@shelter/core/dist/utils/express';
import logger from '@shelter/core/dist/utils/logger';

import Grid from 'gridfs-stream';
import stream from 'stream';

import { NAME } from './constants';
import { connection } from '../../index';

type Request = ExpressRequest & {
  readonly myQuery: ListQuery | Query,
  readonly myBody: any,
  readonly [NAME]: File,
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName } = req.params;
    if (!fileName) {
      next(new HttpError(BAD_REQUEST, 'Invalid resource Id'));

      return;
    }

    const gfs = Grid(connection.db, mongoose.mongo);

    gfs.files.findOne({ filename: fileName }, (err, file) => {
      if (err || !file) {
        next(new HttpError(NOT_FOUND, 'File not found'));

        return;
      }

      const readStream = gfs.createReadStream({
        filename: fileName,
        mode: 'r',
      });

      res.setHeader('Content-Type', file.contentType);

      readStream.pipe(res);
    });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, fileName, content } = req.body;
    const gfs = Grid(connection.db, mongoose.mongo);
    const writeStream = gfs.createWriteStream({
      filename : fileName,
      content_type: contentType,
      mode : 'w',
    });

    const buffer = new Buffer(content, 'base64');
    const bufferStream = new stream.PassThrough();

    // * Write your buffer
    bufferStream.end(buffer);
    bufferStream.pipe(writeStream);

    writeStream.on('error', (err) => {
      logger.error(err);
      next(new HttpError(INTERNAL_SERVER_ERROR, err));
      return;
    });

    writeStream.on('close', (file) => {
      res.send({
        message: `File Created : ${file.filename}`,
      });
    });
  } catch (err) {
    logger.error(err);
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

export {
  create,
  get,
};
