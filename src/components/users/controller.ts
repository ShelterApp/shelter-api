import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { Types } from 'mongoose';
import { User, UserRole } from '@shelter/core/dist';
import { HttpError } from '@shelter/core/dist/utils/error';
import { ListQuery, Query, parseQuery } from '@shelter/core/dist/utils/express';

import Repository from './repository';
import ServiceRepository from '../services/repository';
import FeedbackRepository from '../feedbacks/repository';

type Request = ExpressRequest & {
  readonly myQuery: ListQuery | Query,
  readonly myBody: any,
  readonly userProfile: User,
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const objects = await Repository.list(req.myQuery as ListQuery);

    res.send(objects);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const count = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await Repository.count(req.myQuery as ListQuery);

    res.send({ count });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const object = await Repository.create(req.myBody);

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
      next(new HttpError(NOT_FOUND, 'User not found'));

      return;
    }

    // tslint:disable-next-line:no-object-mutation
    Object.assign(req, { userProfile: object });

    next();
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const get = (req: Request, res: Response) => {
  res.send(req.userProfile);
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const object = await Repository.update({
      ...req.myBody,
      id: req.userProfile.id,
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const del = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [service, feedback] = await Promise.all([
      ServiceRepository.findOne({
        user: req.userProfile.id,
      } as unknown as ListQuery),
      FeedbackRepository.findOne({
        user: req.userProfile.id,
      } as unknown as ListQuery)
    ]);

    if (service || feedback) {
      next(new HttpError(BAD_REQUEST, 'Can’t delete user since they have related services or feedbacks'));

      return;
    }

    const object = await Repository.delete(req.userProfile.id);

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const togglePerm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = (req.userProfile.roles || []).includes(UserRole.Administrator);
    const userRoles = (req.userProfile.roles || []).filter(role => role !== UserRole.Administrator);

    const object = await Repository.update({
      id: req.userProfile.id,
      roles: isAdmin ? [
        ...userRoles,
      ] : [
        ...userRoles,
        UserRole.Administrator,
      ],
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const togglePermSupperUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSupperUser = (req.userProfile.roles || []).includes(UserRole.SupperUser);
    const userRoles = (req.userProfile.roles || []).filter(role => role !== UserRole.SupperUser);

    const object = await Repository.update({
      id: req.userProfile.id,
      roles: isSupperUser ? [
        ...userRoles,
      ] : [
        ...userRoles,
        UserRole.SupperUser,
      ],
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const setPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.myBody;
    const myRoles = role !== UserRole.User ? [
      role,
      UserRole.User,
    ] : [
      UserRole.User,
    ];

    console.log('@myRoles', myRoles);
    
    const object = await Repository.update({
      id: req.userProfile.id,
      roles: myRoles,
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

export {
  list,
  create,
  count,
  getById,
  get,
  update,
  del,
  togglePerm,
  togglePermSupperUser,
  setPermission,
};
