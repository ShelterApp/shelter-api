import { Service, ServiceType } from "@shelter/core/dist";
import logger from "@shelter/core/dist/utils/logger";
import fetch from "isomorphic-unfetch";

import ServiceRepository from "../services/repository";
import {
    getCoordinatesFromLocation,
    transformServicesWithDistances,
} from "../services/utils";
import {
    WEATHER,
    ASK_PARTICULAR_SERVICE,
    ASK_DISTANCE_SERVICE,
    ASK_SERVICE_SCHEDULE,
    SERVICE_MAX_DISTANCE,
    GET_SHELTER_AVAILABLE_BEDS,
    ASK_SERVICE_BED_AVAILABLE,
} from "./constants";

import { formatDate } from "../common/time-parser";

// tslint:disable-next-line:max-line-length
const fulfillmentMessageWeather = async ({ city }) => {
    const buildMessageFulfillmentChatbot = (
        city: string,
        weatherPayload: any
    ) => {
        if (!weatherPayload || !weatherPayload.main) {
            return {
                speech: `Can not get weather from ${city}`,
            };
        }

        const { main } = weatherPayload;
        const message = `Weather in ${city} is ${main.temp} °F`;
        const fulfillmentMessages: any = [
            {
                text: {
                    text: [message],
                },
            },
            {
                payload: {
                    type: WEATHER,
                    data: weatherPayload,
                },
                lang: "en",
                type: 4,
            },
        ];

        return {
            fulfillmentMessages,
            speech: message,
        };
    };

    try {
        if (!city) {
            return {
                speech: "Your city is invalid, please check again",
            };
        }

        const res = await fetch(
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=imperial`
        );

        if (!res.ok) {
            throw await res.json();
        }

        const payload = await res.json();

        return buildMessageFulfillmentChatbot(city, payload);
    } catch (err) {
        logger.error(err);
        return buildMessageFulfillmentChatbot(city, {});
    }
};

const fulfillmentMessageAskParticularService = async ({ any: serviceName }) => {
    const buildMessageFulfillmentChatbot = (payload: Service) => {
        if (!payload || !payload.name) {
            return {
                speech: `We don't have any services with that name`,
            };
        }

        const message = `We have service named ${payload.name}`;
        const fulfillmentMessages: any = [
            {
                text: {
                    text: [message],
                },
            },
            {
                payload: {
                    type: ASK_PARTICULAR_SERVICE,
                    data: payload,
                },
                lang: "en",
                type: 4,
            },
        ];

        return {
            fulfillmentMessages,
            speech: message,
        };
    };

    try {
        if (!serviceName) {
            return {
                speech: "Your service name is invalid, please check again",
            };
        }

        const singleService = await ServiceRepository.findOne({
            name: new RegExp(serviceName, "gi"),
        });

        return buildMessageFulfillmentChatbot(singleService);
    } catch (err) {
        logger.error(err);
        return buildMessageFulfillmentChatbot({});
    }
};

const fulfillmentMessageAskDistanceService = async ({
    any: serviceName,
    location,
}) => {
    const buildMessageFulfillmentChatbot = (payload: Service) => {
        if (!payload || !payload.name) {
            return {
                speech: `We don't have any services with that name`,
            };
        }

        const message = `You are ${payload.distance} miles away from this location`;
        const fulfillmentMessages: any = [
            {
                text: {
                    text: [message],
                },
            },
            {
                payload: {
                    type: ASK_DISTANCE_SERVICE,
                    data: payload,
                },
                lang: "en",
                type: 4,
            },
        ];

        return {
            fulfillmentMessages,
            speech: message,
        };
    };

    try {
        const coordinates = (await getCoordinatesFromLocation(location)) || [];

        if (!coordinates) {
            return {
                speech: "Your location is invalid, please check again",
            };
        }

        if (!serviceName) {
            return {
                speech: "Your service name is invalid, please check again",
            };
        }

        const singleService = await ServiceRepository.findOne({
            name: new RegExp(serviceName, "gi"),
        });

        const transformSingleService = transformServicesWithDistances(
            [singleService],
            `${coordinates[0]}|${coordinates[1]}`
        );

        return buildMessageFulfillmentChatbot(transformSingleService[0]);
    } catch (err) {
        logger.error(err);
        return buildMessageFulfillmentChatbot({});
    }
};

const fulfillmentMessageAskServiceSchedule = async ({ any: serviceName }) => {
    const buildMessageFulfillmentChatbot = (payload: Service) => {
        if (!payload || !payload.name) {
            return {
                speech: `We don't have any services with that name`,
            };
        }

        if (payload.isContact) {
            return {
                speech: `We don’t have any schedule info for this service in our app. Please contact ${payload.name} for hours at ${payload.phone}`,
            };
        }

        const message = `Below is the schedule of ${payload.name}`;
        const fulfillmentMessages: any = [
            {
                text: {
                    text: [message],
                },
            },
            {
                payload: {
                    type: ASK_SERVICE_SCHEDULE,
                    data: payload,
                },
                lang: "en",
                type: 4,
            },
        ];

        return {
            fulfillmentMessages,
            speech: message,
        };
    };

    try {
        if (!serviceName) {
            return {
                speech: "Your service name is invalid, please check again",
            };
        }

        const singleService = await ServiceRepository.findOne({
            name: new RegExp(serviceName, "gi"),
        });

        return buildMessageFulfillmentChatbot(singleService);
    } catch (err) {
        logger.error(err);
        return buildMessageFulfillmentChatbot({});
    }
};

const fulfillmentMessageGetShelterAvailableBeds = async ({ location }) => {
    const buildMessageFulfillmentChatbot = (payload: readonly Service[]) => {
        if (!payload || !payload.length) {
            return {
                speech: `Can't find any services with shelter bed info. Please contact the service providers directly to get more info`,
            };
        }

        const message = `Here are some shelter Services which have beds available near you.`;
        const fulfillmentMessages: any = [
            {
                text: {
                    text: [message],
                },
            },
            {
                payload: {
                    type: GET_SHELTER_AVAILABLE_BEDS,
                    data: payload,
                },
                lang: "en",
                type: 4,
            },
        ];

        return {
            fulfillmentMessages,
            speech: message,
        };
    };

    try {
        const coordinates = (await getCoordinatesFromLocation(location)) || [];

        if (!coordinates) {
            return {
                speech: "Your location is invalid, please check again",
            };
        }

        const nearLocationQuery = coordinates
            ? {
                  location: {
                      $near: {
                          $maxDistance: SERVICE_MAX_DISTANCE,
                          $geometry: {
                              coordinates,
                              type: "Point",
                          },
                      },
                  },
              }
            : {};

        const services = await ServiceRepository.list({
            query: {
                ...nearLocationQuery,
                type: ServiceType.Shelter,
                availableBeds: {
                    $gt: 0,
                },
            },
            limit: 25,
            skip: 0,
            select: [],
            populate: [],
            sort: "-likes",
        });

        const transformSingleService = transformServicesWithDistances(
            services,
            `${coordinates[0]}|${coordinates[1]}`
        );

        return buildMessageFulfillmentChatbot(transformSingleService);
    } catch (err) {
        logger.error(err);
        return buildMessageFulfillmentChatbot([]);
    }
};

const fulfillmentMessageAskServiceAvailableBed = async ({
    any: serviceName,
}) => {
    const buildMessageFulfillmentChatbot = (payload: Service) => {
        if (!payload || !payload.name) {
            return {
                speech: `No shelter services available for this service`,
            };
        }

        // const sematicVerb = payload.availableBeds > 1 ? 'have' : 'has';

        // const message = `${payload.name} ${sematicVerb} ${payload.availableBeds} beds are available. You can reach out to them using ${payload.phone}`;
        const message =
            payload.availableBeds > 0
                ? `${payload.name} has ${
                      payload.availableBeds
                  } beds available. It was last updated on ${formatDate(
                      payload.updatedAt
                  )}. Please reach out to them using ${payload.phone}`
                : `Shelter beds info is not available for this service in our app. Please reach out to them using ${payload.phone} if you need more details.`;
        const fulfillmentMessages: any = [
            {
                text: {
                    text: [message],
                },
            },
            {
                payload: {
                    type: ASK_SERVICE_BED_AVAILABLE,
                    data: payload,
                },
                lang: "en",
                type: 4,
            },
        ];

        return {
            fulfillmentMessages,
            speech: message,
        };
    };

    try {
        if (!serviceName) {
            return {
                speech: `We don't have that info available in our app`,
            };
        }

        const singleService = await ServiceRepository.findOne({
            name: new RegExp(serviceName, "gi"),
            type: ServiceType.Shelter,
            // availableBeds: {
            //   $gt: 0,
            // },
        });

        return buildMessageFulfillmentChatbot(singleService);
    } catch (err) {
        logger.error(err);
        return buildMessageFulfillmentChatbot({});
    }
};

export {
    fulfillmentMessageWeather,
    fulfillmentMessageAskParticularService,
    fulfillmentMessageAskDistanceService,
    fulfillmentMessageAskServiceSchedule,
    fulfillmentMessageGetShelterAvailableBeds,
    fulfillmentMessageAskServiceAvailableBed,
};
