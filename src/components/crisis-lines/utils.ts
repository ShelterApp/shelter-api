import logger from '@shelter/core/dist/utils/logger';
import { CrisisLine } from '@shelter/core/dist';
import { ListQuery } from '@shelter/core/dist/utils/express';

import * as GoogleMapApi from '../common/google-maps';
import Repository from './repository';
import {
  // CRISIS_LINE_MAX_DISTANCE,
  // PLURAL_NAME,
  CRISIS_LINES_LIST,
 } from './constants';

const getCoordinatesFromLocation = async (location: any) => {
  try {
    const address = `${location['business-name']} ${location['street-address']} ${location['city']} ${location['country']}`;
    const place = await GoogleMapApi.searchGeoCode(address);

    const { geometry } = place;
    const { location: geometryLocation } = geometry;

    return [geometryLocation.lng, geometryLocation.lat];
  } catch (err) {
    console.error(err);
    throw new Error('Get Coordinates From Location Failed');
  }
};

// tslint:disable-next-line:max-line-length
const buildMessageFulfillmentChatbot = (crisisLines: readonly CrisisLine[]) => {
  const message = crisisLines.length ? 'If this is an Emergency, please call 911. Please choose the Crisis Lines from below.' :
                  'No crisis lines nearby you!';
  const fulfillmentMessages: any = crisisLines.length ? [
    {
      text: {
        text: [
          message,
        ],
      },
    },
    {
      payload: {
        type: CRISIS_LINES_LIST,
        data: crisisLines,
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

const fulfillmentMessageCrisisLines = async ({ location }) => {
  logger.info('@location', location);
  const coordinates = await getCoordinatesFromLocation(location);
  logger.info('@coodinates');
  logger.info(coordinates);

  const crisisLines = await Repository.list({
    query: {
      location: {
        $near: {
          // $maxDistance: CRISIS_LINE_MAX_DISTANCE,
          $geometry: {
            coordinates,
            type: 'Point',
          },
        },
      },
    },
    select: [],
    populate: [],
    sort: '-ranking',
    limit: 100,
    skip: 0,
  } as ListQuery);

  return buildMessageFulfillmentChatbot(crisisLines);
};

export {
  fulfillmentMessageCrisisLines,
};
