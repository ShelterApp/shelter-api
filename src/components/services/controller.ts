import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { UserRole } from '@shelter/core';
import { Types } from 'mongoose';
import { Service, User, ServiceType, City, Zip, ScheduleType, DayPeriod,
        ScheduleCategory } from '@shelter/core/dist';
import { HttpError } from '@shelter/core/dist/utils/error';
import { ListQuery, Query, parseQuery } from '@shelter/core/dist/utils/express';
import logger from '@shelter/core/dist/utils/logger';

import {
  NAME,
  // SERVICE_MAX_DISTANCE,
  SEARCH_SUMMARY_KEYWORD_MAPPING,
 } from './constants';
import Repository from './repository';
import CityRepository from '../cities/repository';
import ZipRepository from '../zips/repository';
import FeedbackRepository from '../feedbacks/repository';
import UserRepository from '../users/repository';
import * as GoogleMapApi from '../common/google-maps';
import { parseTimeToSeconds } from '../common/time-parser';
import { buildOpenServiceQuery, createCity, createZip, transformServicesWithDistances } from './utils';
import { sendMessageToAdminGroup, sendMessageToSpecificUser } from '../common/push-notifications';

import {
  SERVICE_CREATION_ADMIN,
  SERVICE_UPDATION_ADMIN,
  SERVICE_DELETION_ADMIN,
  SERVICE_APPROVAL_USER,
  SERVICE_INCREASE_KUDO_USER,
} from '../templates/constants';

type Request = ExpressRequest & {
  readonly myQuery: ListQuery | Query,
  readonly myBody: any,
  readonly [NAME]: Service,
  readonly user: User;
  readonly session: any;
  // tslint:disable-next-line:readonly-keyword
  city: City;
  // tslint:disable-next-line:readonly-keyword
  zip: Zip;
};

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userTimezone = 0, sort = '', search, q: searchValue } = req.query;
    const { query: defaultQuery } = req.myQuery as ListQuery;
    console.log('@req.query', req.query);

    const {
      // isApproved = false,
      isOpen = false,
      isShowAll = false,
      isCriticalHeader = false,
      nearCoordinate,
      // userCoordinate,
      currentCoordinate,
      category = '',
      ...query
    } = defaultQuery;

    logger.info('currentCoordinate', currentCoordinate);

    // tslint:disable-next-line:max-line-length
    // * If user shares location and when current location is selected, it shouldn’t show a service if it’s more than 50 miles from it’s location.
    // * 50 miles ~ 80km
    const extendedNearLocationQuery = currentCoordinate && isCriticalHeader ? {
      $maxDistance: 80000,
    } : {};

    const nearLocations = sort !== 'likes' && nearCoordinate && nearCoordinate !== '0|0' ? {
      location: {
        $near: {
          // $maxDistance: SERVICE_MAX_DISTANCE,
          ...extendedNearLocationQuery,
          $geometry: {
            type: 'Point',
            // * long, lat
            coordinates: [+nearCoordinate.split('|')[0], +nearCoordinate.split('|')[1]],
          },
        },
      },
    } : {};

    const categoryServices = category ? category !== ScheduleCategory.All ? {
      $and: [{
        category,
      }, {
        category: {
          $ne: ScheduleCategory.All,
        },
      }],
    } : {
      category,
    }
    : {};

    const openServices = isOpen === 'true' ? {
      ...buildOpenServiceQuery(+userTimezone),
      'schedules.type': {
        $ne: 'DATE_RANGE', // * the service will never show up in the List/Map view
      },
      isContact: false,
    } : {};

    const showAllCondition = isShowAll !== 'true' ? {
      'closeSchedules.type': {
        $ne: 'PERMANENTLY_CLOSED', // * Exclude all services with PERMANENTLY_CLOSED
      },
    } : {};

    const criticalHeaderCondition = isCriticalHeader ? {
      isCriticalHeader: true,
      $or: [{
        isCriticalNeverExpire: true,
      }, {
        criticalExpiredAt: {
          $gt: new Date(),
        },
      }],
    } : {};

    // tslint:disable-next-line:max-line-length
    const extendSearchSummaryCondition = search && search.includes('serviceSummary') && SEARCH_SUMMARY_KEYWORD_MAPPING[searchValue] 
        ? {
          serviceSummary: {
            $in: SEARCH_SUMMARY_KEYWORD_MAPPING[searchValue].map((keyword: string) => {
              return new RegExp(keyword, 'gi');
            }),
          },
        } : {};

    // tslint:disable-next-line:max-line-length
    if (query['$and'] && query['$and'].length && query['$and'][0]['$or'] && extendSearchSummaryCondition && extendSearchSummaryCondition.serviceSummary) {
      // query['$and'][0]['$or'] = [];
      query['$and'][0]['$or'] = [{
        serviceSummary: extendSearchSummaryCondition.serviceSummary,
      }];
    }


    const customQuery = {
      ...query,
      ...nearLocations,
      ...openServices,
      ...categoryServices,
      ...showAllCondition,
      ...criticalHeaderCondition,
      // ...extendSearchSummaryCondition,
    };

    const objects = await Repository.list({
      ...req.myQuery,
      query: customQuery,
    } as ListQuery);

    res.send(currentCoordinate
      ? transformServicesWithDistances(objects, currentCoordinate)
      : objects);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const count = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userTimezone = 0, sort = '', search, q: searchValue } = req.query;
    const { query: defaultQuery } = req.myQuery as ListQuery;
    const {
      // isApproved = false,
      isOpen = false,
      isShowAll = false,
      isCriticalHeader = false,
      nearCoordinate,
      currentCoordinate,
      category = '',
      ...query
    } = defaultQuery;

    logger.info('currentCoordinate', currentCoordinate);

    // * If user shares location and when current location is selected, it shouldn’t show a service if it’s more than 50 miles from it’s location.
    // * 50 miles ~ 80km
    const extendedNearLocationQuery = nearCoordinate && isCriticalHeader ? {
      $maxDistance: 80000,
    } : {};

    const nearLocations = sort !== 'likes' && nearCoordinate && nearCoordinate !== '0|0' ? {
      location: {
        $near: {
          // $maxDistance: SERVICE_MAX_DISTANCE,
          ...extendedNearLocationQuery,
          $geometry: {
            type: 'Point',
            // * long, lat
            coordinates: [+nearCoordinate.split('|')[0], +nearCoordinate.split('|')[1]],
          },
        },
      },
    } : {};

    const categoryServices = category ? category !== ScheduleCategory.All ? {
      $and: [{
        category,
      }, {
        category: {
          $ne: ScheduleCategory.All,
        },
      }],
    } : {
      category,
    }
    : {};

    const openServices = isOpen === 'true' ? {
      ...buildOpenServiceQuery(+userTimezone),
      'schedules.type': {
        $ne: 'DATE_RANGE', // * the service will never show up in the List/Map view
      },
      isContact: false,
    } : {};

    const showAllCondition = isShowAll !== 'true' ? {
      'closeSchedules.type': {
        $ne: 'PERMANENTLY_CLOSED', // * Exclude all services with PERMANENTLY_CLOSED
      },
    } : {};

    const criticalHeaderCondition = isCriticalHeader ? {
      isCriticalHeader: true,
      $or: [{
        isCriticalNeverExpire: true,
      }, {
        criticalExpiredAt: {
          $gt: new Date(),
        },
      }],
    } : {};
    
    // const customQuery = isApproved === 'true' ? {
    //   ...query,
    //   ...nearLocations,
    //   ...openServices,
    //   ...categoryServices,
    //   ...extraCondition,
    // } : {
    //   ...query,
    //   isApproved,
    // };

    const extendSearchSummaryCondition = search && search === 'serviceSummary' && SEARCH_SUMMARY_KEYWORD_MAPPING[searchValue] 
        ? {
          serviceSummary: {
            $in: SEARCH_SUMMARY_KEYWORD_MAPPING[searchValue].map((keyword: string) => {
              return new RegExp(keyword, 'gi');
            }),
          }
        } : {};

    if (query['$and'] && query['$and'].length && query['$and'][0]['$or'] && extendSearchSummaryCondition && extendSearchSummaryCondition.serviceSummary) {
      // query['$and'][0]['$or'] = [];
      query['$and'][0]['$or'] = [{
        serviceSummary: extendSearchSummaryCondition.serviceSummary,
      }];
    }

    const customQuery = {
      ...query,
      ...nearLocations,
      ...openServices,
      ...categoryServices,
      ...showAllCondition,
      ...criticalHeaderCondition,
      // ...extendSearchSummaryCondition,
    };

    const count = await Repository.count({
      ...req.myQuery,
      query: customQuery,
    } as ListQuery);

    res.send({ count });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSupperUser = (req.user.roles || []).includes(UserRole.SupperUser);
    const isAutoUser = (req.user.roles || []).includes(UserRole.AutoUser);
    const isAdmin = (req.user.roles || []).includes(UserRole.Administrator);
    if (!isAdmin) {
      const numCreatedServices = await Repository.count({
        query:  {
          user: req.user.id,
        },
      } as unknown as ListQuery);

      if (numCreatedServices >= req.user.totalServices) {
        next(new HttpError(BAD_REQUEST, 'Reached the max limit'));

        return;
      }
    }

    const {
      name,
      address1,
      address2,
      state,
      city,
      zip,
      schedules = [],
      closeSchedules = [],
      userEmail: ownerEmail = '',
    } = req.myBody;
    const placeQuery1 = `${address1} ${state} ${city} ${zip}`;
    const placeQuery2 = `${address2} ${state} ${city} ${zip}`;
    const place = (await GoogleMapApi.searchGeoCode(placeQuery1))
                  || (await GoogleMapApi.searchGeoCode(placeQuery2));

    // tslint:disable-next-line:no-let
    let coordinates: ReadonlyArray<any> = [0, 0];
    if (place) {
      const { geometry } = place;
      const { location } = geometry;

      coordinates = [location.lng, location.lat];
    }

    const userEmail = ownerEmail.toLowerCase();
    
    const {
      isCriticalHeader = false,
      criticalDescription,
      criticalExpiredAt,
      isCriticalNeverExpire,
      ...restBody
    } = req.myBody;

    let ownerServiceUpdate = {};
    if (userEmail) {
      // * Check new userEmail existed or not
      console.log('@userEmail', userEmail);
      const existedUser = await UserRepository.getByEmail(userEmail);
      if (!existedUser) {
        next(new HttpError(BAD_REQUEST, 'User email not found'));

        return;
      }

      ownerServiceUpdate = {
        userEmail,
        user: existedUser.id,
      };
    }

    // * Update ""Creating & Updating Service API"" For Supper User -> Auto Approve for this type"
    const autoApproved = (isSupperUser || isAutoUser) ? {
      isApproved: true,
      approvedAt: new Date(),
    } : {};

    const criticalObj = (isAdmin || isSupperUser) ? {
      isCriticalHeader,
      criticalDescription,
      criticalExpiredAt,
      isCriticalNeverExpire,
    } : {};

    const object = await Repository.create({
      location: {
        coordinates,
      },
      ...restBody,
      user: req.user.id,
      ...ownerServiceUpdate,
      schedules: schedules.map((schedule) => {
        if ([
          ScheduleType.Weekly,
          ScheduleType.Monthly,
          ScheduleType.DateRange,
        ].includes(schedule.type)) {
          // tslint:disable-next-line:no-object-mutation
          const { day = DayPeriod.Monday, startTime, endTime } = schedule;
          return {
            ...schedule,
            startTimeSeconds: startTime ? parseTimeToSeconds(day, startTime) : 0,
            endTimeSeconds: endTime ? parseTimeToSeconds(day, endTime) : 0,
          };
        }

        return schedule;
      }),
      closeSchedules: closeSchedules.map((schedule) => {
        if ([ScheduleType.Monthly, ScheduleType.DateRange].includes(schedule.type)) {
          // tslint:disable-next-line:no-object-mutation
          const { day = DayPeriod.Monday, startTime, endTime } = schedule;

          return {
            ...schedule,
            startTimeSeconds: startTime ? parseTimeToSeconds(day, startTime) : 0,
            endTimeSeconds: endTime ? parseTimeToSeconds(day, endTime) : 0,
          };
        }

        return schedule;
      }),
      ...autoApproved,
      ...criticalObj,
    });

    // * Send notification
    sendMessageToAdminGroup(SERVICE_CREATION_ADMIN, {
      serviceName: name,
      userEmail: req.user.email,
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
      next(new HttpError(NOT_FOUND, 'Service not found'));

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
    const { address1, address2, state, city, zip,
      schedules = [],
      closeSchedules = [],
      userEmail: ownerEmail = '',
     } = req.myBody;
    const placeQuery1 = `${address1} ${state} ${city} ${zip}`;
    const placeQuery2 = `${address2} ${state} ${city} ${zip}`;
    const place = (await GoogleMapApi.searchGeoCode(placeQuery1))
                  || (await GoogleMapApi.searchGeoCode(placeQuery2));

    // tslint:disable-next-line:no-let
    let coordinates: ReadonlyArray<number> = [0, 0];
    if (place) {
      const { geometry } = place;
      const { location } = geometry;

      coordinates = [location.lng, location.lat];
    }

    const {
      isCriticalHeader = false,
      criticalDescription,
      criticalExpiredAt,
      isCriticalNeverExpire,
      ...restBody
    } = req.myBody;

    const userEmail = ownerEmail.toLowerCase();

    let ownerServiceUpdate = {};
    if (userEmail !== req[NAME].userEmail) {
      // * Check new userEmail existed or not
      const existedUser = await UserRepository.getByEmail(userEmail);
      if (!existedUser) {
        next(new HttpError(BAD_REQUEST, 'User email not found'));

        return;
      }

      ownerServiceUpdate = {
        userEmail,
        user: existedUser.id,
      };
    }

    // * Update ""Creating & Updating Service API"" For Supper User -> Auto Approve for this type"
    const isSupperUser = (req.user.roles || []).includes(UserRole.SupperUser);
    const isAutoUser = (req.user.roles || []).includes(UserRole.AutoUser);
    const isAdmin = (req.user.roles || []).includes(UserRole.Administrator);

    const autoApproved = isSupperUser || isAutoUser ? {
      isApproved: true,
      approvedAt: new Date(),
    } : {};

    const criticalObj = (isAdmin || isSupperUser) ? {
      isCriticalHeader,
      criticalDescription,
      criticalExpiredAt,
      isCriticalNeverExpire,
    } : {};

    const object = await Repository.update({
      id: req[NAME].id,
      ...restBody,
      ...ownerServiceUpdate,
      location: {
        coordinates,
      },
      // tslint:disable-next-line:no-identical-functions
      schedules: schedules.map((schedule) => {
        if ([
          ScheduleType.Weekly,
          ScheduleType.Monthly,
          ScheduleType.DateRange,
        ].includes(schedule.type)) {
          // tslint:disable-next-line:no-object-mutation
          const { day = DayPeriod.Monday, startTime, endTime } = schedule;
          return {
            ...schedule,
            startTimeSeconds: startTime ? parseTimeToSeconds(day, startTime) : 0,
            endTimeSeconds: endTime ? parseTimeToSeconds(day, endTime) : 0,
          };
        }

        return schedule;
      }),
      // tslint:disable-next-line:no-identical-functions
      closeSchedules: closeSchedules.map((schedule) => {
        if ([ScheduleType.Monthly, ScheduleType.DateRange].includes(schedule.type)) {
          // tslint:disable-next-line:no-object-mutation
          const { day = DayPeriod.Monday, startTime, endTime } = schedule;

          return {
            ...schedule,
            startTimeSeconds: startTime ? parseTimeToSeconds(day, startTime) : 0,
            endTimeSeconds: endTime ? parseTimeToSeconds(day, endTime) : 0,
          };
        }

        return schedule;
      }),
      isApproved: (isAdmin || isSupperUser) ? req[NAME].isApproved : false,
      ...autoApproved,
      ...criticalObj,
    });

    if (Object.keys(ownerServiceUpdate).length) {
      // * Update feedbacks of services to new user as well
      FeedbackRepository.updateMultiServicesOwner(req[NAME].id, (ownerServiceUpdate as any).user);
    }

    // * Send notification
    sendMessageToAdminGroup(SERVICE_UPDATION_ADMIN, {
      serviceName: req[NAME].name,
      userEmail: req.user.email,
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const del = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const object = await Repository.delete(req[NAME].id);

    // Delete related feedbacks
    const feedbacks = await FeedbackRepository.list({
      query: {
        service: req[NAME].id,
      },
      populate: [],
      sort: '_id',
      limit: 0,
      skip: 0,
    } as unknown as ListQuery);

    if (feedbacks.length) {
      feedbacks.map(feedback => FeedbackRepository.delete(feedback.id))
    }

    // * Send notification
    sendMessageToAdminGroup(SERVICE_DELETION_ADMIN, {
      serviceName: req[NAME].name,
      userEmail: req.user.email,
    });

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const likes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const object = await Repository.increaseLikes(req[NAME].id);

    // * Send notification
    sendMessageToSpecificUser(req[NAME].user.toString(), SERVICE_INCREASE_KUDO_USER);

    res.send(object);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const approveServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { services: serviceIds } = req.myBody;

    const services = await Repository.list({
      query: {
        _id: {
          $in: serviceIds,
        },
      },
      select: ['_id', 'city', 'zip', 'state', 'user', 'name'],
      populate: [],
      sort: '_id',
      limit: 0,
      skip: 0,
    } as ListQuery);

    // * Create city & zip
    if (!services || !services.length) {
      next(new HttpError(NOT_FOUND, 'Service not found'));

      return;
    }

    // * Create bulk of city
    await Promise.all(services.map(service => createCity(service.city, service.state)));
    // * Create bulk of zip
    await Promise.all(services.map(service => createZip(service.zip)));

    for (const service of services) {
      await Repository.update({
        isApproved: true,
        id: service.id,
        approvedAt: new Date(),
      });

      // * Send notification
      sendMessageToSpecificUser(service.user.toString(), SERVICE_APPROVAL_USER, {
        serviceName: service.name,
      });
    }

    res.send({
      message: 'Approved all services',
    });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const removeServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { services: serviceIds } = req.myBody;

    const services = await Repository.list({
      query: {
        _id: {
          $in: serviceIds,
        },
      },
      select: ['_id'],
      populate: [],
      sort: '_id',
      limit: 0,
      skip: 0,
    } as ListQuery);

    if (!services.length) {
      res.send({
        message: 'Removed all services',
      });

      return;
    }

    for (const service of services) {
      await Repository.delete(service.id);
    }

    res.send({
      message: 'Removed all services',
    });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const listOfBeds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user.roles.includes(UserRole.Administrator);
    const filterByUser = !isAdmin ? {
      user: req.user.id,
    } : {};

    const objects = await Repository.list({
      ...req.myQuery,
      query: {
        type: {
          $in: [ServiceType.Shelter],
        },
        $or: [{
          availableBeds: {
            $gt: 0,
          },
        }, {
          totalBeds: {
            $gt: 0,
          },
        }],
        ...filterByUser,
      },
    } as ListQuery);

    res.send(objects);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const updateAvailableBeds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user.roles.includes(UserRole.Administrator);
    const filterByUser = !isAdmin ? {
      user: req.user.id,
    } : {};
    const { services } = req.myBody;

    for (const { id, total } of services) {
      const service = await Repository.findOne({
        _id: id,
        type: {
          $in: [ServiceType.Shelter],
        },
        ...filterByUser,
      });

      if (!service) continue;

      await Repository.update({
        id,
        availableBeds: total,
      });
    }

    res.send({
      message: 'Updated available beds for all services',
    });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const searchCityOrZip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword } = req.myBody;

    const [cities, zips] = await Promise.all([
      CityRepository.search(keyword),
      ZipRepository.search(keyword),
    ]);

    res.send({
      cities,
      zips,
    });
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const testSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const values = SEARCH_SUMMARY_KEYWORD_MAPPING['Meals'].map((keyword: string) => {
      return new RegExp(keyword, 'gi');
    });

    console.log(values);
    const objects = await Repository.list({
      ...req.myQuery,
      query: {
        serviceSummary: {
          $in: values,
        },
      },
    } as ListQuery);

    console.log({
      ...req.myQuery,
      query: {
        serviceSummary: {
          $in: values,
        },
      },
    });

    res.send(objects);
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
  likes,
  approveServices,
  removeServices,
  listOfBeds,
  updateAvailableBeds,
  createCity,
  createZip,
  searchCityOrZip,
  testSearch,
};
