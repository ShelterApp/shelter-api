import logger from '@shelter/core/dist/utils/logger';
import fetch from 'isomorphic-unfetch';

const dialogflow = require('@google-cloud/dialogflow');
const sessionClient = new dialogflow.SessionsClient();

import { jsonToStructProto } from './struct-json';
import { intentData } from './intent-data';
// import { HOMELESS_RESOURCE_SERVICES_REGEX, HOMELESS_RESOURCE_SERVICES_EVENT } from './constants';

const detectIntent = async (
  projectId,
  sessionId,
  query,
  contexts,
  languageCode,
  data,
) => {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId,
  );


  const { coordinate } = data;
  const { location = coordinate } = data;

  const parameters = jsonToStructProto({
    coordinate,
    location,
  });

  const eventIntent = intentData[query.toLowerCase()];

  console.log('@location', location);
  console.log('@eventIntent', eventIntent);
  console.log('@parameters', parameters);

  const eventQuery = eventIntent && location ? {
    event : {
      parameters,
      languageCode,
      name: eventIntent.event,
    },
  } : {};

  // * Homeless resource services
  // if ((!eventQuery || !eventQuery.event) && location) {
  //   // * Check words in query match with regex for event "homeless_resource_services"
  //   const matched = query.toLowerCase().match(HOMELESS_RESOURCE_SERVICES_REGEX);
  //   console.log('@matched', matched);
  //   console.log('@query', query);

  //   console.log('HOMELESS_RESOURCE_SERVICES_EVENT', HOMELESS_RESOURCE_SERVICES_EVENT);

  //   if (matched && matched.length) {
  //     eventQuery = {
  //       event : {
  //         name: HOMELESS_RESOURCE_SERVICES_EVENT, // * for serviceSummary, category, open
  //         parameters: parameters,
  //         languageCode: languageCode,
  //       },
  //     } 
  //   }
  // }

  // console.log('@eventQuery', eventQuery);

  // The text query request.
  const request: any = {
    session: sessionPath,
    queryInput: {
      text: {
        languageCode,
        text: query,
      },
      ...eventQuery,
    },
    // queryParams: {
    //   payload: parameters,
    // },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts,
    };
    // ['contexts'] = contexts;
  }

  // console.log('@request');
  // console.log(JSON.stringify(request, null, 2));

  // console.log('@contexts', contexts);

  const responses = await sessionClient.detectIntent(request);
  // console.log('@responses', JSON.stringify(responses, null, 2));

  return responses[0];
}

// tslint:disable-next-line:no-let
let context;

const executeQueries = async (projectId, sessionId, queries, languageCode, data) => {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  // tslint:disable-next-line:no-let
  let intentResponse;
  for (const query of queries) {
    try {
      console.log(`Sending Query: ${query}`);

      intentResponse = await detectIntent(
        projectId,
        sessionId,
        query,
        context,
        languageCode,
        data,
      );

      // * Use the context from this response for next queries
      context = intentResponse.queryResult.outputContexts;

      return intentResponse.queryResult;
    } catch (error) {
      console.log(error);
    }
  }
}

const query = async (query, sessionId) => {
  logger.info(`Chat bot query: ${query}`);
  try {
    const payload = {
      query,
      sessionId,
      v: '20150910',
      lang: 'en',
    };

    const res = await fetch('https://api.dialogflow.com/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GOOGLE_DIALOG_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw await res.json();
    }

    const response = await res.json();

    return response.result;
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || `Query google dialog flow failed - ${query}`);
  }
};

export {
  query,
  executeQueries,
};
