import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { File, User } from '@shelter/core';
import { HttpError } from '@shelter/core/dist/utils/error';
import { ListQuery, Query } from '@shelter/core/dist/utils/express';
import logger from '@shelter/core/dist/utils/logger';
import { ServiceType } from '@shelter/core/dist';

import { executeQueries } from '../common/google-dialogflow';
import { fulfillmentMessageByServiceType } from '../services/utils';
import { fulfillmentMessageCrisisLines } from '../crisis-lines/utils';
import {
  NAME,
  CHATBOT_SOURCE,
  HOMELESS_RESOURCE_CATEGORY,
  HOMELESS_RESOURCE_LOCATION,
  HOMELESS_RESOURCE_OPEN,
  CRISIS_LINES,
  WEATHER,
  HOMELESS_RESOURCE_SERVICES,
  HOMELESS_RESOURCE_CITY_OR_ZIP,
  ASK_PARTICULAR_SERVICE,
  ASK_DISTANCE_SERVICE,
  ASK_SERVICE_SCHEDULE,
  GET_SHELTER_AVAILABLE_BEDS,
  ASK_SERVICE_BED_AVAILABLE,
} from './constants';

import {
  fulfillmentMessageWeather,
  fulfillmentMessageAskParticularService,
  fulfillmentMessageAskDistanceService,
  fulfillmentMessageAskServiceSchedule,
  fulfillmentMessageGetShelterAvailableBeds,
  fulfillmentMessageAskServiceAvailableBed,
} from './utils';
import * as dashbot from '../common/dashbot';

type Request = ExpressRequest & {
  readonly session: any,
  readonly myQuery: ListQuery | Query,
  readonly myBody: any,
  readonly [NAME]: File,
  readonly user: User,
};

// tslint:disable-next-line
let botRequestCache = {};

// * Reset botRequestCache
/* tslint:disable */
setTimeout(() => {
  botRequestCache = {}; 
}, 60 * 60 * 1000); // Reset each 1 hour
/* tslint:enable */

const query = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { myBody } = req;
    const { query, location, coordinate, type, chatToken, userTimezone = 0 } = myBody;
    console.log('@botRequestCache', botRequestCache);

    if (!botRequestCache[chatToken]) {
      // tslint:disable-next-line
      botRequestCache[chatToken] = {
        userTimezone,
        skip: 0,
      };
    }

    if (query === 'Yes') {
      // tslint:disable-next-line
      botRequestCache[chatToken].skip += 1;
    } else {
      // tslint:disable-next-line
      botRequestCache[chatToken].skip = 0;
    }

    dashbot.logIncoming(query, chatToken);

    // const { fulfillment } = await dialogQuery(query, chatToken);
    const result: any = await executeQueries('shelterapp-1573928197721', chatToken, [query], 'en', {
      location,
      coordinate,
      type,
    });
    const { fulfillmentMessages, fulfillmentText } : any = result;
    dashbot.logOutgoing(fulfillmentText, chatToken, fulfillmentMessages);

    res.send(fulfillmentMessages);
  } catch (err) {
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

const hook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('@hook');
    logger.info(JSON.stringify(req.myBody, null, 2));

    const { queryResult = {}, session } = req.myBody;
    const [, sessionId] = session.includes(':') ? session.split(':') : session.split('sessions/');

    const { parameters: defaultParameters = {}, outputContexts = [], queryText } = queryResult;
    // tslint:disable-next-line:no-inverted-boolean-check
    // const isLoadMore = !!(queryText === 'Yes');
    // tslint:disable-next-line
    let parameters = defaultParameters;

    if (!parameters.length && outputContexts.length) {
      const { parameters: contextParameters } = outputContexts[0]; // * first context
      parameters = contextParameters;
    }

    const { type } = parameters;

    logger.info('@queryResult');
    logger.info(JSON.stringify(queryResult, null, 2));

    // logger.info('@outputContexts');
    // logger.info(outputContexts);

    logger.info('@parameters');
    logger.info(parameters);

    // logger.info('@session', session);
    // logger.info('@botRequestCache', botRequestCache);

    console.log('@type', type);
    console.log('@queryText', queryText);

    if (queryText.toLowerCase() === 'no') {
      const speech = 'Thank You. Please ping me back with \"Hi\" if you are looking for any other services. Bye for now.';
      return res.json({
        speech,
        fulfillmentText: speech,
        displayText: speech,
        source: CHATBOT_SOURCE,
      });
    }

    switch (type) {
      case ServiceType.Food:
      case ServiceType.Shelter:
      case ServiceType.Health:
      case ServiceType.Resources:
      case ServiceType.Work:
      case HOMELESS_RESOURCE_SERVICES:
      case HOMELESS_RESOURCE_CITY_OR_ZIP:
      case HOMELESS_RESOURCE_CATEGORY:
      case HOMELESS_RESOURCE_LOCATION:
      case HOMELESS_RESOURCE_OPEN: {
        // tslint:disable-next-line:max-line-length
        console.log('@----------------- parameters', JSON.stringify(parameters, null, 2));

        // tslint:disable-next-line:max-line-length
        const { speech, fulfillmentMessages } = await fulfillmentMessageByServiceType(parameters, botRequestCache[sessionId].skip, botRequestCache[sessionId].userTimezone);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
      case CRISIS_LINES: {
        const { speech, fulfillmentMessages } = await fulfillmentMessageCrisisLines(parameters);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
      case WEATHER: {
        const { speech, fulfillmentMessages }: any = await fulfillmentMessageWeather(parameters);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
      case ASK_PARTICULAR_SERVICE: {
        // tslint:disable-next-line:max-line-length
        const { speech, fulfillmentMessages }: any = await fulfillmentMessageAskParticularService(parameters);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
      case ASK_DISTANCE_SERVICE: {
        // tslint:disable-next-line:max-line-length
        const { speech, fulfillmentMessages }: any = await fulfillmentMessageAskDistanceService(parameters);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
      case ASK_SERVICE_SCHEDULE: {
        // tslint:disable-next-line:max-line-length
        const { speech, fulfillmentMessages }: any = await fulfillmentMessageAskServiceSchedule(parameters);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
      case GET_SHELTER_AVAILABLE_BEDS: {
        // tslint:disable-next-line:max-line-length
        const { speech, fulfillmentMessages }: any = await fulfillmentMessageGetShelterAvailableBeds(parameters);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
      case ASK_SERVICE_BED_AVAILABLE: {
        // tslint:disable-next-line:max-line-length
        const { speech, fulfillmentMessages }: any = await fulfillmentMessageAskServiceAvailableBed(parameters);

        return res.json({
          speech,
          fulfillmentMessages,
          fulfillmentText: speech,
          displayText: speech,
          source: CHATBOT_SOURCE,
        });
      }
    }

    // * Small talk
    const { fulfillmentText, fulfillmentMessages } = queryResult;
    if (fulfillmentText) {
      return res.json({
        fulfillmentMessages,
        fulfillmentText,
        speech: fulfillmentText,
        displayText: fulfillmentText,
        source: CHATBOT_SOURCE,
      });
    }

    const speechDefault = 'Service unavailable, please help to contact administrator resolve this problem, Thanks';
    return res.json({
      speech: speechDefault,
      fulfillmentText: speechDefault,
      displayText: speechDefault,
      source: CHATBOT_SOURCE,
    });
  } catch (err) {
    console.error(err);
    next(new HttpError(INTERNAL_SERVER_ERROR, err));
  }
};

export {
  query,
  hook,
};
