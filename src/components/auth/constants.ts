import { AccountProvider, RequestPasswordType, PushPlatform } from '@shelter/core/dist';

const NAME = 'auth';

// tslint:disable-next-line: readonly-array
const SOCIAL_LOGIN_TYPE = [
  AccountProvider.Facebook,
  AccountProvider.Google,
  AccountProvider.Twitter,
  AccountProvider.Instagram,
];

// tslint:disable-next-line: readonly-array
const REQUEST_PASSWORD_TYPE = [
  RequestPasswordType.Web,
  RequestPasswordType.Mobile,
];

// tslint:disable-next-line: readonly-array
const PLATFORM_TYPE = [
  PushPlatform.Ios,
  PushPlatform.Android,
  PushPlatform.Web,
];

export {
  NAME,
  SOCIAL_LOGIN_TYPE,
  REQUEST_PASSWORD_TYPE,
  PLATFORM_TYPE,
};
