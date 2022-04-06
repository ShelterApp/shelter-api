import { PushPlatform, UserRole, AccountProvider } from '@shelter/core';

const NAME = 'user';
const PLURAL_NAME = 'users';

// tslint:disable-next-line: readonly-array
const PLATFORM_TYPE: ReadonlyArray<PushPlatform> = [
  PushPlatform.Ios,
  PushPlatform.Android,
  PushPlatform.Web,
];

const USER_ROLES: ReadonlyArray<UserRole> = [
  UserRole.User,
  UserRole.Administrator,
  UserRole.SupperUser,
  UserRole.AutoUser,
];

const ACCOUNT_PROVIDERS = [
  AccountProvider.Local,
  AccountProvider.Facebook,
  AccountProvider.Google,
  AccountProvider.Instagram,
  AccountProvider.Twitter,
];

export {
  NAME, PLURAL_NAME,
  PLATFORM_TYPE,
  USER_ROLES,
  ACCOUNT_PROVIDERS,
};
