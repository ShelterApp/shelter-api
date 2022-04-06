import { Template } from '@shelter/core';
import logger from '@shelter/core/dist/utils/logger';

import TemplatesRepository from './components/templates/repository';
import {
  SERVICE_CREATION_ADMIN,
  SERVICE_UPDATION_ADMIN,
  SERVICE_DELETION_ADMIN,
  AUTH_SIGNUP_ADMIN,
  APP_FEEDBACK_CREATION_ADMIN,
  SERVICE_FEEDBACK_CREATION_ADMIN,
  SERVICE_APPROVAL_USER,
  SERVICE_FEEDBACK_CREATION_USER,
  SERVICE_INCREASE_KUDO_USER,
} from './components/templates/constants';

// * key = MODULE_EVENT_GROUP_USER
/* tslint:disable */
const templates: ReadonlyArray<Template> = [{
  _id: '5d8b1aa434e3359547b56255',
  key: SERVICE_CREATION_ADMIN,
  name: 'Send a notification to admin after a service is added by provider.',
  content: '{serviceName} is created by {userEmail} and waiting for approval.',
}, {
  _id: '5d8b1aa434e3359547b56256',
  key: SERVICE_UPDATION_ADMIN,
  name: 'Send a notification to admin after a service is updated by provider.',
  content: '{serviceName} is updated and waiting for approval.',
}, {
  _id: '5d8b1aa434e3359547b56257',
  key: SERVICE_DELETION_ADMIN,
  name: 'Send a notification to admin after a service is Deleted by provider.',
  content: '{serviceName} is deleted by {userEmail}.',
}, {
  _id: '5d8b1aa434e3359547b56258',
  key: AUTH_SIGNUP_ADMIN,
  name: 'Send a notification to admin after a provider is signed up.',
  content: '{providerName} signed up successfully.',
}, {
  _id: '5da6d68fa38509087a15e4d8',
  key: APP_FEEDBACK_CREATION_ADMIN,
  name: 'Send a notification to admin when a user sends App Feedback.',
  content: 'Check app feedback from {userName}.',
}, {
  _id: '5da6d6a8a38509087a15e4f3',
  key: SERVICE_FEEDBACK_CREATION_ADMIN,
  name: 'Send a notification to admin when a user sends Service Feedback.',
  content: 'Check service feedback from {userName}.',
}, {
  _id: '5da6d6bba38509087a15e50a',
  key: SERVICE_APPROVAL_USER,
  name: 'Send a notification to provider after a service is approved by admin.',
  content: '{serviceName} is approved and published on the app.',
}, {
  _id: '5da6d6d5a38509087a15e528',
  key: SERVICE_FEEDBACK_CREATION_USER,
  name: 'Send a notification to provider when a user sends Service Feedback.',
  content: 'Please check your feedback from {userName}. ',
}, {
  _id: '5dad6c006c80976936b42535',
  key: SERVICE_INCREASE_KUDO_USER,
  name: 'Send a notification to provider after a user gives Kudos.',
  content: 'Congrats!! Your service got Kudos from a user. Keep up the good work!',
}];

const initData = async () => {
  // * generated data for templates
  await TemplatesRepository.generatedDedicatedData(templates);

  logger.info('> Initialized data successfully');
};

export default initData;
