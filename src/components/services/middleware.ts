import * as yup from 'yup';
import { validateBody } from '@shelter/core/dist/utils/express';
import { ScheduleType } from '@shelter/core/dist';

import { SCHEDULE_CATEGORY_TYPE, SERVICE_TYPE, MONTH_PERIOD_TYPE, DAY_PERIOD_TYPE } from './constants';

const weeklyScheduleTypeSchema = yup.object().shape({
  day: yup.string().oneOf(DAY_PERIOD_TYPE).required(),
  startTime: yup.string().required(),
  endTime: yup.string().required(),
  type: yup.string().oneOf([ScheduleType.Weekly]).required(),
});

const weeklyScheduleTypeCloseScheduleSchema = yup.object().shape({
  day: yup.string().oneOf(DAY_PERIOD_TYPE).required(),
  type: yup.string().oneOf([ScheduleType.Weekly]).required(),
});

const monthlyScheduleTypeSchema = yup.object().shape({
  day: yup.string().oneOf(DAY_PERIOD_TYPE).required(),
  period: yup.string().oneOf(MONTH_PERIOD_TYPE).required(),
  startTime: yup.string(),
  endTime: yup.string(),
  type: yup.string().oneOf([ScheduleType.Monthly]).required(),
});

const dateRangeScheduleTypeSchema = yup.object().shape({
  startDate: yup.string().required(),
  endDate: yup.string().required(),
  startTime: yup.string(),
  endTime: yup.string(),
  type: yup.string().oneOf([ScheduleType.DateRange]).required(),
});

const fullDayScheduleTypeSchema = yup.object().shape({
  type: yup.string().oneOf([ScheduleType.FullDay]).required(),
});

const permanentClosedScheduleTypeSchema = yup.object().shape({
  type: yup.string().oneOf([ScheduleType.PermanentlyClosed]).required(),
});

const baseSchema = {
  name: yup.string().required(),
  description: yup.string().required(),
  address1: yup.string().required(),
  address2: yup.string(),
  city: yup.string().required(),
  country: yup.string().required(),
  state: yup.string().required(),
  phone: yup.string(),
  category: yup.array().of(
    yup.string().oneOf(SCHEDULE_CATEGORY_TYPE).required(),
  ).required(),
  isContact: yup.boolean(),
  schedules: yup.array().oneOfSchemas([
    weeklyScheduleTypeSchema,
    monthlyScheduleTypeSchema,
    dateRangeScheduleTypeSchema,
    fullDayScheduleTypeSchema,
  ]).when(['isContact'], {
    is: (value: boolean) => !value,
    then: yup.array().required(),
  }),
  closeSchedules: yup.array().oneOfSchemas([
    weeklyScheduleTypeCloseScheduleSchema,
    monthlyScheduleTypeSchema,
    dateRangeScheduleTypeSchema,
    permanentClosedScheduleTypeSchema,
  ]),
  isSelectedAll: yup.boolean(),
  type: yup.array().of(
    yup.string().oneOf(SERVICE_TYPE).required(),
  ).required(),
  serviceSummary: yup.string().required(),
  isShowFlag: yup.boolean(),
  isShowDonate: yup.boolean(),
  contactEmail: yup.string(),
  website: yup.string(),
  facebook: yup.string(),
  twitter: yup.string(),
  instagram: yup.string(),
  youtube: yup.string(),
  zip: yup.string().required(),
  age: yup.string(),
  userEmail: yup.string(),
  totalBeds: yup.number(),
  availableBeds: yup.number(),
  // * critical
  isCriticalHeader: yup.boolean(),
  criticalDescription: yup.string(),
  criticalExpiredAt: yup.string(),
  isCriticalNeverExpire: yup.boolean(),
};
const validateCreate = validateBody(
  (v: any) => yup.object(baseSchema).noUnknown().validateSync(v),
);

const validateUpdate = validateBody(
  (v: any) => yup.object(baseSchema).noUnknown().validateSync(v),
);

const listServiceIdSchema = {
  services: yup.array().of(
    yup.string().required(),
  ).required(),
};

const validateListOfServiceId = validateBody(
  (v: any) => yup.object(listServiceIdSchema).noUnknown().validateSync(v),
);

const updateAvailableBedsSchema = {
  services: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      total: yup.number().required(),
    }),
  ).required(),
};

const validateUpdateAvailableBeds = validateBody(
  (v: any) => yup.object(updateAvailableBedsSchema).noUnknown().validateSync(v),
);

const searchCityOrZipSchema = {
  keyword: yup.string().required(),
};

const validateSearchCityOrZip = validateBody(
  (v: any) => yup.object(searchCityOrZipSchema).noUnknown().validateSync(v),
);

export {
  validateCreate,
  validateUpdate,
  validateListOfServiceId,
  validateUpdateAvailableBeds,
  validateSearchCityOrZip,
};
