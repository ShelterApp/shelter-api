import { AccountProvider } from '@shelter/core';

const NAME = 'account';
const PLURAL_NAME = 'accounts';

// tslint:disable-next-line: readonly-array
const PROVIDERS = [
  AccountProvider.Local,
  AccountProvider.Facebook,
  AccountProvider.Twitter,
  AccountProvider.Instagram,
  AccountProvider.Google,
];

const LOCAL_USERNAME_PATH = 'credentials.email';
const LOCAL_PASSWORD_PATH = 'credentials.password';
const LOCAL_PASSWORD_TOKEN = 'credentials.passwordToken';
const LOCAL_PASSWORD_TOKEN_EXPIRES = 'credentials.passwordTokenExpires';

const PASSWORD_TOKEN_LENGTH = 20;
const PASSWORD_TOKEN_EXPIRY = 3600000; // 1 HOUR

export {
  NAME, PLURAL_NAME,
  PROVIDERS,
  LOCAL_USERNAME_PATH,
  LOCAL_PASSWORD_PATH,
  LOCAL_PASSWORD_TOKEN,
  LOCAL_PASSWORD_TOKEN_EXPIRES,
  PASSWORD_TOKEN_LENGTH,
  PASSWORD_TOKEN_EXPIRY,
};
