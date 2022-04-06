import {  UserRole, User } from '@shelter/core/dist';
import logger from '@shelter/core/dist/utils/logger';

import UserRepository from '../../users/repository';
import TemplateRepository from '../../templates/repository';
import { pushNotification } from '../firebase';

const mapMessageByData = (messageTemplate: string, data: any) => {
  return messageTemplate.replace(/{[^{}]+}/g, (key: string) => {
    return data[key.replace(/[{}]+/g, '')] || '';
  });
};

const sendMessageToAdminGroup = async (templateKey: string, data: any) => {
  logger.info('@sendMessageToAdminGroup');
  const users = await UserRepository.list({
    query: {
      roles: {
        $in: [UserRole.Administrator],
      },
    },
    select: ['_id', 'city', 'zip'],
    populate: [],
    sort: '_id',
    limit: 0,
    skip: 0,
  });

  if (!users || !users.length) {
    return;
  }

  const template = await TemplateRepository.getByKey(templateKey);
  const message = mapMessageByData(template.content, data);

  // * Send message to users with type ADMIN
  const registeredTokens = users.reduce((listToken, user: User) => {
    const userDevices = user.devices || [];
    userDevices.forEach((userDevice) => {
      listToken.push(userDevice.token);
    });

    return listToken;
  },                                    []);

  for (const deviceToken of registeredTokens) {
    await pushNotification(deviceToken, message);
  }
};

const sendMessageToSpecificUser = async (userId: string, templateKey: string, data?: any) => {
  logger.info('@sendMessageToSpecificUser');
  const user = await UserRepository.get(userId);
  if (!user) {
    return;
  }

  const userDevices = user.devices || [];
  const registeredTokens = userDevices.map(device => device.token);

  const template = await TemplateRepository.getByKey(templateKey);
  const message = mapMessageByData(template.content, data);

  for (const deviceToken of registeredTokens) {
    await pushNotification(deviceToken, message);
  }
};

export {
  sendMessageToAdminGroup,
  sendMessageToSpecificUser,
};
