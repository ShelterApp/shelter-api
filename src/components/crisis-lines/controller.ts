import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { Types } from 'mongoose';
import { CrisisLine } from '@shelter/core/dist';
import { HttpError } from '@shelter/core/dist/utils/error';
import { ListQuery, Query, parseQuery } from '@shelter/core/dist/utils/express';

import { NAME } from './constants';
import Repository from './repository';
import * as GoogleMapApi from '../common/google-maps';

type Request = ExpressRequest & {
  readonly myQuery: ListQuery | Query,
  readonly myBody: any,
  readonly [NAME]: CrisisLine,
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
    const { name, area } = req.myBody;
    const placeQuery = `${name} ${area}`;
    const place = await GoogleMapApi.searchGeoCode(placeQuery);

    // tslint:disable-next-line:no-let
    let coordinates: ReadonlyArray<any> = [0, 0];
    if (place) {
      const { geometry } = place;
      const { location } = geometry;

      coordinates = [location.lng, location.lat];
    }

    const object = await Repository.create({
      ...req.myBody,
      location: {
        coordinates,
      },
      ranking: area === 'USA' ? 1 : 0,
    });

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
      next(new HttpError(NOT_FOUND, 'Crisis line not found'));

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
    const { name, area } = req.myBody;
    const placeQuery = `${name} ${area}`;
    const place = await GoogleMapApi.searchGeoCode(placeQuery);
    // tslint:disable-next-line:no-let
    let coordinates: ReadonlyArray<any> = [0, 0];
    if (place) {
      const { geometry } = place;
      const { location } = geometry;

      coordinates = [location.lng, location.lat];
    }

    const object = await Repository.update({
      ...req.myBody,
      id: req[NAME].id,
      location: {
        coordinates,
      },
      ranking: area === 'USA' ? 1 : 0,
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
  create,
  count,
  getById,
  get,
  update,
  del,
};
