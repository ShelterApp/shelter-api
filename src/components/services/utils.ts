import logger from '@shelter/core/dist/utils/logger';
import { ScheduleType, MonthPeriod, Service, ScheduleCategory } from '@shelter/core/dist';
import { ListQuery } from '@shelter/core/dist/utils/express';

import {
  DAY_PERIOD_TYPE,
  MONTH_PERIOD_TYPE,
  // SERVICE_MAX_DISTANCE,
  SEARCH_SUMMARY_KEYWORD_MAPPING,
  SERVICE_TYPE,
  SCHEDULE_CATEGORY_TYPE,
  SERVICES_LIST,
  MAP_CATEGORY_TYPES,
 } from './constants';
import {
  parseTimeToSeconds,
  getTotalWeeksInMonth,
  getCurrentWeekIndex,
 } from '../common/time-parser';
import CityRepository from '../cities/repository';
import ZipRepository from '../zips/repository';
import Repository from './repository';
import * as GoogleMapApi from '../common/google-maps';

const SERVICE_LIMIT_DEFAULT = 10;

function getDistanceFromLatLonInKm(lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function kilometersToMiles(km: number): number {
  return km * 0.621371;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// tslint:disable-next-line
const buildOpenServiceQuery = (timezone = 0) => {
  const now = new Date();
  console.log('@process.env.NODE_ENV', process.env.NODE_ENV);
  // * Start time of server is UTC 0, should disable this line when test isOpen on local
  now.setTime(now.getTime() - (timezone * 60 * 1000));

  console.log(now.getDay());
  const dayIndex = now.getDay() - 1;
  const currentDay = DAY_PERIOD_TYPE[dayIndex === -1 ? 6 : dayIndex];
  const currentSeconds = parseTimeToSeconds(
    currentDay, `${now.getHours()}:${now.getMinutes()}`,
    true);

  console.log('@now', now);
  console.log('@currentDay', currentDay);
  console.log('@currentSeconds', currentSeconds);

  const totalWeeksInMonth = getTotalWeeksInMonth(now.getFullYear(), now.getMonth());
  console.log('@totalWeeksInMonth', totalWeeksInMonth);
  // * Get current week index in month
  const currentWeekIndex = getCurrentWeekIndex(now);
  const currentWeekOfMonth = MONTH_PERIOD_TYPE[currentWeekIndex];

  // * Query calculation of open schedules
  /* tslint:disable */
  const weekQuery = {
    schedules: {
      $elemMatch: {
        type: ScheduleType.Weekly,
        day: currentDay,
        startTimeSeconds: {
          $lte: currentSeconds,
        },
        endTimeSeconds: {
          $gte: currentSeconds,
        },
      }
    }
  };

  const monthQuery = currentWeekIndex === totalWeeksInMonth ? [
    {
      schedules: {
        $elemMatch: {
          type: ScheduleType.Monthly,
          day: currentDay,
          period: currentWeekOfMonth,
          startTimeSeconds: {
            $lte: currentSeconds,
          },
          endTimeSeconds: {
            $gte: currentSeconds,
          },   
        }
      }
    },
    {
      schedules: {
        $elemMatch: {
          type: ScheduleType.Monthly,
          day: currentDay,
          period: MonthPeriod.Last,
          startTimeSeconds: {
            $lte: currentSeconds,
          },
          endTimeSeconds: {
            $gte: currentSeconds,
          },
        }
      }
    }
  ] : [{
    schedules: {
      $elemMatch: {
        type: ScheduleType.Monthly,
        day: currentDay,
        period: currentWeekOfMonth,
        startTimeSeconds: {
          $lte: currentSeconds,
        },
        endTimeSeconds: {
          $gte: currentSeconds,
        },
      }
    }
  }];

  const dateRangeQuery = {
    schedules: {
      $elemMatch: {
        startTime: {
          $lte: now,
        },
        endTime: {
          $gte: now,
        },
        startTimeSeconds: {
          $lte: currentSeconds,
        },
        endTimeSeconds: {
          $gte: currentSeconds,
        },
        type: ScheduleType.DateRange,
      }
    }
  };

  const fullDayQuery = {
    'schedules.type': ScheduleType.FullDay,
  };

  // * Query calculation of close schedules
  const weekClosedQuery = {
    closeSchedules: {
      $elemMatch: {
        type: ScheduleType.Weekly,
        day: currentDay,
      }
    }
  };

  console.log('@currentWeekIndex', currentWeekIndex);
  console.log('@totalWeeksInMonth', totalWeeksInMonth);

  const monthClosedQuery = currentWeekIndex === totalWeeksInMonth ? [
    {
      closeSchedules: {
        $elemMatch: {
          type: ScheduleType.Monthly,
          day: currentDay,
          period: currentWeekOfMonth,
          startTimeSeconds: {
            $lte: currentSeconds,
          },
          endTimeSeconds: {
            $gte: currentSeconds,
          },
        }
      }
    },
    {
      closeSchedules: {
        $elemMatch: {
          type: ScheduleType.Monthly,
          day: currentDay,
          period: MonthPeriod.Last,
          startTimeSeconds: {
            $lte: currentSeconds,
          },
          endTimeSeconds: {
            $gte: currentSeconds,
          },
        }
      }
    }
  ] : [{
    closeSchedules: {
      $elemMatch: {
        type: ScheduleType.Monthly,
        day: currentDay,
        period: currentWeekOfMonth,
        startTimeSeconds: {
          $lte: currentSeconds,
        },
        endTimeSeconds: {
          $gte: currentSeconds,
        },
      }
    }
  }];

  const dateRangeClosedQuery = {
    startTime: {
      $lte: now,
    },
    endTime: {
      $gte: now,
    },
    closeSchedules: {
      $elemMatch: {
        startTimeSeconds: {
          $lte: currentSeconds,
        },
        endTimeSeconds: {
          $gte: currentSeconds,
        },
        type: ScheduleType.DateRange,
      }
    }
  };

  const permanentClosedQuery = {
    'closeSchedules.type': ScheduleType.PermanentlyClosed,
  };
  /* tslint:enable */
  return {
    $or: [
      weekQuery,
      ...monthQuery,
      dateRangeQuery,
      fullDayQuery,
    ],
    $nor: [
      weekClosedQuery,
      ...monthClosedQuery,
      dateRangeClosedQuery,
      permanentClosedQuery,
    ],
  };
};

const createCity = async (cityName: string, stateName: string) => {
  if (!cityName) {
    return;
  }

  try {
    const city = await CityRepository.findOne({
      name: cityName,
      state: stateName,
    });
    if (!city) {
      // * Get city coordinates by city name

      const searchValue = stateName ? `${cityName} ${stateName}` : cityName;
      const place = await GoogleMapApi.searchPlace(searchValue);

      if (!place) {
        return await CityRepository.create({
          name: cityName,
          state: stateName,
          search: searchValue,
        });
      }

      const { geometry } = place;
      const { location } = geometry;

      return await CityRepository.create({
        name: cityName,
        state: stateName,
        search: searchValue,
        location: {
          coordinates: [location.lng, location.lat] as any,
        },
      });
    }

    return city;
  } catch (err) {
    logger.error(err);
  }
};

const createZip = async (zipCode: string) => {
  if (!zipCode) {
    return;
  }

  try {
    const zip = await ZipRepository.getByCode(zipCode);
    if (!zip) {
      // * Get zip coordinates by zip code
      const place = await GoogleMapApi.searchGeoCode(zipCode);
      if (!place) {
        return await ZipRepository.create({
          code: zipCode,
        });
      }

      const { geometry } = place;
      const { location } = geometry;

      return await ZipRepository.create({
        code: zipCode,
        location: {
          coordinates: [location.lng, location.lat] as any,
        },
      });
    }
  } catch (err) {
    logger.error(err);
  }
};

const transformServicesWithDistances = (services, nearCoordinate) => {
  if (!nearCoordinate) {

    return services;
  }

  const [long, lat] = nearCoordinate.split('|');

  return services.map((service) => {
    const { location } = service;
    const distanceKm = getDistanceFromLatLonInKm(
      +lat,
      +long,
      location.coordinates[1],
      location.coordinates[0]) || 0;

    const distanceMiles = kilometersToMiles(distanceKm).toFixed(1);

    return location ? {
      ...service,
      distance: distanceMiles,
    } : service;
  });
};

const getCoordinatesFromLocation = async (location: any | string) => {
  // tslint:disable-next-line
  try {
    if (!location) {
      return;
    }

    const address = typeof location === 'object' ? `${location['business-name']} ${location['street-address']} ${location['city']} ${location['zip-code']} ${location['country']}` : location;
    const place = await GoogleMapApi.searchGeoCode(address) || await GoogleMapApi.searchPlace(address);

    const { geometry } = place || {};
    const { location: geometryLocation } = geometry;

    return [geometryLocation.lng, geometryLocation.lat];
  } catch (err) {
    console.error(err);
    // throw new Error('Get Coordinates From Location Failed');
    return;
  }
};

// tslint:disable-next-line:max-line-length
const buildMessageFulfillmentChatbot = (services: readonly Service[], _: string, value: string, location: any, coordinate: string, city: string, zip: string, resource: string, category: string, open?: string) => {
  const categoryValue = category ? MAP_CATEGORY_TYPES[category] : category;

  // tslint:disable-next-line
  const address = typeof location === 'object' ? location['business-name'] ?
                  `${location['business-name']} ${location['street-address']} ${location['city']} ${location['country']}` :
                  `${location['street-address']} ${location['city']} ${location['zip-code']} ${location['country']}` : coordinate ? 'your current location' : location;
  const message = services.length ? open ? `Below are some services that show as open now in ${city || zip || (address || '').trim()}` : `Below are some of the ${value || resource || categoryValue} services close to ${city || zip || (address || '').trim()}` :
                  'Sorry, I couldn’t find any services in our app for your request.';

  const fulfillmentMessages: any = services.length ? [
    {
      text: {
        text: [
          message,
        ],
      },
    },
    {
      payload: {
        type: SERVICES_LIST,
        data: services,
      },
      lang: 'en',
      type: 4,
    },
    {
      text: {
        text: [
          'Would you like to see more services?',
        ],
      },
      type: 0,
    },
    {
      payload: {
        text: 'Would you like to see more services?',
        quick_replies: [
          {
            text: 'Yes',
            payload: 'yes',
          },
          {
            text: 'No',
            payload: 'no',
          },
          {
            text: 'More Info',
            payload: 'moreinfo',
          },
        ],
      },
      lang: 'en',
      type: 4,
    },
  ] : [
    {
      text: {
        text: [
          message,
        ],
      },
    },
  ];

  return {
    fulfillmentMessages,
    speech: message,
  };
};

const fulfillmentMessageByServiceType = async (
  { city, zip, type, value, location, category, open, coordinate, resource }
  // tslint:disable-next-line:align
  , serviceSkip = 0, userTimezone = 0) => {
  logger.info('@fulfillmentMessageByServiceType');
  logger.info('@value', value);
  logger.info('@location', location);
  logger.info('@coordinate', coordinate);
  logger.info('@city-zip', city, zip);
  console.log('@open', open);
  // tslint:disable-next-line:no-let
  let coordinates;

  if (city || zip) {
  // if (!coordinate) {
    coordinates = await getCoordinatesFromLocation(city || zip || location);
  }

  if (!coordinates) {
    // tslint:disable-next-line:max-line-length
    coordinates = coordinate ? coordinate.split('|').map(coor => +coor).reverse() : await getCoordinatesFromLocation(location);
  }

  const typeService = SERVICE_TYPE.includes(type) ? {
    type,
  } : undefined;

  const categoryService = SCHEDULE_CATEGORY_TYPE.includes(category) ? {
    $and: [{
      category,
    }, {
      category: {
        $ne: ScheduleCategory.All,
      },
    }],
  } : undefined;

  const openServices = open ? {
    ...buildOpenServiceQuery(+userTimezone),
    'schedules.type': {
      $ne: 'DATE_RANGE', // * the service will never show up in the List/Map view
    },
    isContact: false,
  } : {};

  const closedQuery = {
    'closeSchedules.type': {
      $ne: 'PERMANENTLY_CLOSED', // * Exclude all services with PERMANENTLY_CLOSED
    },
  };

  // tslint:disable-next-line:max-line-length
  const searchValues = (resource || value) ? resource ? [new RegExp(resource, 'gi')] : SEARCH_SUMMARY_KEYWORD_MAPPING[value].map((keyword: string) => {
    return new RegExp(keyword, 'gi');
  }) : [];

  const serviceSummaryQuery = searchValues.length ? {
    serviceSummary: {
      $in: searchValues,
    },
  } : {};

  const skip = SERVICE_LIMIT_DEFAULT * serviceSkip;

  const nearLocationQuery = coordinates ? {
    location: {
      $near: {
        // $maxDistance: SERVICE_MAX_DISTANCE,
        $geometry: {
          coordinates,
          type: 'Point',
        },
      },
    },
  } : {};

  // console.log('@searchValues', searchValues);

  // tslint:disable-next-line:no-let
  let services;

  if (coordinate) {
    services = await Repository.list({
      skip,
      query: {
        ...nearLocationQuery,
        ...serviceSummaryQuery,
        ...typeService,
        ...categoryService,
        ...openServices,
        ...closedQuery,
      },
      select: [''],
      populate: [],
      sort: '-likes',
      limit: SERVICE_LIMIT_DEFAULT,
    } as ListQuery);
  } else {
    // * Get one services
    const nearestServices = await Repository.list({
      skip,
      query: {
        ...nearLocationQuery,
        ...closedQuery,
      },
      select: [''],
      populate: [],
      sort: '-likes',
      limit: 1,
    } as ListQuery);

    const nearestService = nearestServices[0] || {}; 

    if (!nearestService || !nearestService.city) {
      services = [];
    }

    services = await Repository.list({
      skip,
      query: {
        city: new RegExp(nearestService.city, 'gi'),
        ...serviceSummaryQuery,
        ...typeService,
        ...categoryService,
        ...openServices,
        ...closedQuery,
      },
      select: [''],
      populate: [],
      sort: '-likes',
      limit: SERVICE_LIMIT_DEFAULT,
    } as ListQuery);
  }

  const transformServices = coordinate ? transformServicesWithDistances(services, `${coordinates[0]}|${coordinates[1]}`) : (services as Service[]).sort((a, b) => b.likes - a.likes);

  return buildMessageFulfillmentChatbot(coordinate ? transformServicesWithDistances(services, `${coordinates[0]}|${coordinates[1]}`) : transformServices,
                                        // tslint:disable-next-line:max-line-length
                                        type, value, location, coordinate, city, zip, resource, category, open);
};

export {
  buildOpenServiceQuery,
  createCity,
  createZip,
  transformServicesWithDistances,
  fulfillmentMessageByServiceType,
  getCoordinatesFromLocation,
};
