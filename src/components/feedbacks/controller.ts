import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import mongoose, { Types } from 'mongoose';
import Grid from 'gridfs-stream';
import stream from 'stream';
import { Feedback, User, UserRole, File, FeedbackType } from '@shelter/core/dist';
import { HttpError } from '@shelter/core/dist/utils/error';
import { ListQuery, Query, parseQuery } from '@shelter/core/dist/utils/express';
import logger from '@shelter/core/dist/utils/logger';

import { NAME } from './constants';
import Repository from './repository';
import ServiceRepository from '../services/repository';
import { connection } from '../../index';
import { sendMessageToAdminGroup, sendMessageToSpecificUser } from '../common/push-notifications';
import {
  APP_FEEDBACK_CREATION_ADMIN,
  SERVICE_FEEDBACK_CREATION_ADMIN,
  SERVICE_FEEDBACK_CREATION_USER,
} from '../templates/constants';
import { sendServiceFeedbackToProvider, sendServiceFeedbackToUser, sendAppFeedbackToUser } from '../common/gmail';

type Request = ExpressRequest & {
  readonly myQuery: ListQuery | Query,
  readonly myBody: any,
  readonly [NAME]: Feedback,
  readonly user: User;
  // tslint:disable-next-line:readonly-keyword
  files: readonly File[],
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query: defaultQuery } = req.myQuery as ListQuery;

    const isAdmin = req.user.roles.includes(UserRole.Administrator);
    const query = {
      ...defaultQuery,
    };

    if (!isAdmin) {
      // tslint:disable-next-line:no-object-mutation
      query.serviceOwner = req.user.id;
    }

    const objects = await Repository.list({
      ...req.myQuery,
      query,
    } as ListQuery);

    res.send(objects);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const count = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query: defaultQuery } = req.myQuery as ListQuery;

    const isAdmin = req.user.roles.includes(UserRole.Administrator);
    const query = {
      ...defaultQuery,
    };

    if (!isAdmin) {
      // tslint:disable-next-line:no-object-mutation
      query.serviceOwner = req.user.id;
    }

    const count = await Repository.count({
      ...req.myQuery,
      query,
    } as ListQuery);

    res.send({ count });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const createFiles = async (req: Request, _: Response, next: NextFunction) => {
  try {
    const { files = [] } = req.myBody;
    if (!files.length) {
      next();

      return;
    }

    const newFiles = await Promise.all(files.map((file) => {
      return new Promise((resolve, reject) => {
        const { contentType, fileName, content, type } = file;
        const gfs = Grid(connection.db, mongoose.mongo);
        const fileNameUnique = `${mongoose.Types.ObjectId()}.${type}`;
        const writeStream = gfs.createWriteStream({
          filename : fileNameUnique,
          content_type: contentType,
          aliases: fileName,
          mode : 'w',
        });

        const buffer = new Buffer(content, 'base64');
        const bufferStream = new stream.PassThrough();

        // * Write your buffer
        bufferStream.end(buffer);
        bufferStream.pipe(writeStream);

        writeStream.on('error', reject);

        writeStream.on('close', (file) => {
          resolve(file);
        });
      });
    }));

    // tslint:disable-next-line ter-arrow-parens no-object-mutation
    req.files = newFiles.map((file) => (file as any).filename);

    next();
  } catch (err) {
    logger.error(err);
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const createServiceFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      coordinates: defaultCoordinates = '0|0',
      service: serviceId,
      name,
      email,
      phone,
      message,
    } = req.myBody;
    // tslint:disable-next-line:no-let
    let service;

    if (serviceId) {
      service = await ServiceRepository.get(serviceId);
      if (!service) {
        next(new HttpError(NOT_FOUND, 'Service not found'));

        return;
      }
    }

    const coordinates = defaultCoordinates.split('|');

    const object = await Repository.create({
      ...req.myBody,
      location: {
        coordinates: [coordinates[0], coordinates[1]],
      },
      serviceOwner: service ? service.user : undefined,
      // user: req.user.id,
      files: req.files,
      type: FeedbackType.Service,
    });

    // * Send notification
    sendMessageToAdminGroup(SERVICE_FEEDBACK_CREATION_ADMIN, {
      userName: name || email,
    });

    sendMessageToSpecificUser(service.user, SERVICE_FEEDBACK_CREATION_USER, {
      userName: name || email,
    });

    // * Send email to provider
    sendServiceFeedbackToProvider({
      email: service.userEmail,
      userName: name,
      userEmail: email,
      userPhone: phone,
      userMessage: message,
      serviceName: service.name,
    });

    // * Send email to user
    if (email) {
      sendServiceFeedbackToUser({
        email,
        serviceName: service.name,
        servicePhone: service.phone,
        serviceEmail: service.contactEmail,
      });
    }
    

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const createAppFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { coordinates: defaultCoordinates = '0|0', email } = req.myBody;

    const coordinates = defaultCoordinates.split('|');

    // tslint:disable-next-line:no-let
    const object = await Repository.create({
      ...req.myBody,
      location: {
        coordinates: [coordinates[0], coordinates[1]],
      },
      type: FeedbackType.App,
    });

    // * Send notification
    sendMessageToAdminGroup(APP_FEEDBACK_CREATION_ADMIN, {
      userName: email,
    });

    // * Send email to user
    if (email) {
      sendAppFeedbackToUser({
        email,
      });
    }

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const getById = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.params.id || !Types.ObjectId.isValid(req.params.id)) {
    next(new HttpError(BAD_REQUEST, 'Invalid resource Id'));

    return;
  }

  try {
    const object = await Repository.get(req.params.id, parseQuery(req.query));

    if (!object) {
      next(new HttpError(NOT_FOUND, 'Feedback not found'));

      return;
    }

    // tslint:disable-next-line:no-object-mutation
    Object.assign(req, { [NAME]: object });

    next();
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const get = (req: Request, res: Response) => {
  res.send(req[NAME]);
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { coordinates = [0 , 0] } = req.myBody;
    const object = await Repository.update({
      ...req.myBody,
      id: req[NAME].id,
      location: {
        coordinates,
      },
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const archive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const object = await Repository.update({
      id: req[NAME].id,
      isArchive: true,
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const del = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const object = await Repository.delete(req[NAME].id);

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

export {
  list,
  createServiceFeedback,
  createAppFeedback,
  count,
  getById,
  get,
  update,
  del,
  archive,
  createFiles,
};
