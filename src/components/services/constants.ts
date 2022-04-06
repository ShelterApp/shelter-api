import { ScheduleCategory, ServiceType, ScheduleType, MonthPeriod, DayPeriod } from '@shelter/core/dist';

const NAME = 'service';
const PLURAL_NAME = 'services';
const SERVICES_LIST = 'SERVICES_LIST';

const SERVICE_MAX_DISTANCE = 100000; // * 100km

// tslint:disable-next-line: readonly-array
const SCHEDULE_CATEGORY_TYPE = [
  ScheduleCategory.Men,
  ScheduleCategory.Women,
  ScheduleCategory.Kids,
  ScheduleCategory.Seniors,
  ScheduleCategory.Disabled,
  ScheduleCategory.Families,
  ScheduleCategory.Lgbt,
  ScheduleCategory.All,
];

// tslint:disable-next-line: readonly-array
const SERVICE_TYPE = [
  ServiceType.Food,
  ServiceType.Shelter,
  ServiceType.Health,
  ServiceType.Resources,
  ServiceType.Work,
];

// tslint:disable-next-line: readonly-array
const SCHEDULE_TYPE = [
  ScheduleType.Weekly,
  ScheduleType.Monthly,
  ScheduleType.DateRange,
  ScheduleType.FullDay,
  ScheduleType.PermanentlyClosed,
];

// tslint:disable-next-line: readonly-array
const MONTH_PERIOD_TYPE = [
  MonthPeriod.First,
  MonthPeriod.Second,
  MonthPeriod.Third,
  MonthPeriod.Fourth,
  MonthPeriod.Fifth,
  MonthPeriod.Last,
];

// tslint:disable-next-line: readonly-array
const DAY_PERIOD_TYPE = [
  DayPeriod.Monday,
  DayPeriod.Tuesday,
  DayPeriod.Wednesday,
  DayPeriod.Thursday,
  DayPeriod.Friday,
  DayPeriod.Saturday,
  DayPeriod.Sunday,
];

const MAP_CATEGORY_TYPES = {
  [ScheduleCategory.Men]: 'Men',
  [ScheduleCategory.Women]: 'Women',
  [ScheduleCategory.Kids]: 'Youth\/Kids',
  [ScheduleCategory.Seniors]: 'Seniors',
  [ScheduleCategory.Disabled]: 'Disabled',
  [ScheduleCategory.Families]: 'Families',
  [ScheduleCategory.Lgbt]: 'LGBT',
};

const SEARCH_SUMMARY_FIELD = 'serviceSummary';
// tslint:disable-next-line: readonly-array
const SEARCH_SUMMARY_KEYWORD_MAPPING = {
  // * Food
  'Meals': [
    'Meals',
    'Soup Kitchen',
    'Senior Lunch',
    'Sack Lunch',
    'Breakfast',
    'Dinner',
    'Lunch',
    'Congregate meal',
  ],
  'Food Pantry': [
    'Community Garden',
    'Cupboard',
    'Emergency Food',
    'Food Bank',
    'Food Closet',
    'Food Pantry',
    'Food Stamp',
    'Food Voucher',
    'Nutrition',
    'SNAP',
    'Nutrition',
    'TANF',
  ],
  // * Shelter
  'Coordinated Entry': [
    'Coordinated Access',
    'Coordinated Entry',
    'Regional Access Point',
    'Shelter Intake',
    'Central Intake',
  ],
  'Emergency Shelter': [
    'Emergency Shelter',
  ],
  Transitional: [
    'Transitional',
  ],
  'Transitional Housing': [
    'Transitional',
  ],
  // * Additional
  Shelter: [
    'Cooling Center',
    'Day Shelter',
    'Domestic Violence Shelter',
    'Drop-in Center',
    'Emergency Shelter',
    'Homeless Shelter',
    'Night Shelter',
    'Shelter',
    'Warming Center',
    'Winter Shelter',
  ],
  // * Health
  'Medical Care': [
    'Dental',
    'Drug Vouchers,Foot',
    'HIV/AIDS Testing',
    'Health',
    'HepB Test',
    'Massage',
    'Medical',
    'Medical Clinic',
    'Medical Exam',
    'Medical Screening',
    'Pregnancy Test',
    'Screening,Syringe Access',
    'Vaccines',
    'Vision',
    'Needle Exchange',
  ],
  'Mental Health': [
    'Behavior',
    'Counseling',
    'Emotional',
    'Mental',
    'Mental Health',
  ],
  'Substance Abuse Treatment': [
    'Substance Abuse',
    'Sober Living',
    'Detox',
    'Behavioral Health',
    'Sober',
    'Addiction',
    'Addiction Treatment',
    'Alcohol',
    'Drugs',
    'substance',
  ],
  // * Resources
  Assistance: [
    'Assistance',
  ],
  Clothing: [
    'Attire',
    'Blanket',
    'Clothing',
    'Clothing Closet',
    'Clothing Voucher',
    'Diaper',
    'Rug',
    'Swag',
    'Work Clothes',
  ],
  Education: [
    'AfterSchool',
    'Classes',
    'Education',
    'Exam',
    'GED',
    'Mentor',
    'PreSchool',
    'Scholar',
    'School',
    'Test',
    'after school',
  ],
  Hygiene: [
    'Bathrooms',
    'Hygiene',
    'Hygiene Supplies',
    'Hygiene kits',
    'Laundry',
    'Restrooms',
    'Showers',
    'Toilet',
    'feminine supplies',
  ],
  Tech: [
    'Wifi',
    'Internet',
    'Computer',
    'web',
  ],
  // * Additional
  'Financial Assistance': [
    'Assistance',
    'Bill',
    'Energy Assistance',
    'Finanical Assistance',
    'Funds',
    'Money',
    'Rent Assistance',
    'Utility Assistance',
    'Deposit Assistance',
  ],
  Housing: [
    'Affordable Housing',
    'HIV/AIDS Housing',
    'Housing,Long Term Housing',
    'Low income Housing',
    'Mental Illness Housing',
    'Permanent Housing',
    'Rapid Rehousing',
    'Short Term Housing',
    'Subsidized Housing',
    'Supportive Housing',
    'Transitional Housing',
    'Transitional',
  ],
  Resource: [
    'Furniture',
    'Gift',
    'Goods',
    'Household Items',
    'Items',
    'Mail',
    'Personal',
    'Phone',
    'Supplies',
    'Toys',
  ],
  Transit: [
    'Bus',
    'Bus Voucher',
    'Gas',
    'Tokens',
    'Transit',
    'Transportation',
    'Travel',
  ],
  'Legal Assistance': [
    'Legal Assistance',
    'Legal Clinic',
    'Tax',
    'Legal',
    'Notary',
    'Legal Advocacy',
  ],
  Library: [
    'Library',
    'Libraries',
    'Books',
    'Charging Station',
    'Read',
  ],
  Pets: [
    'Pets',
    'Veterinary',
    'Vet',
    'Pet Food',
    'Vet care',
  ],
  // * Work
  Work: [
    'Employment',
    'Employment Assistance',
    'Interview',
    'Job',
    'Job Assistance',
    'Job Search',
    'Job Training',
    'Life Skills',
    'Pay',
    'Resume',
    'Skills',
    'Training',
    'Work',
  ],
};

export {
  NAME, PLURAL_NAME,
  SCHEDULE_CATEGORY_TYPE,
  SERVICE_TYPE,
  SCHEDULE_TYPE,
  MONTH_PERIOD_TYPE,
  DAY_PERIOD_TYPE,
  SERVICE_MAX_DISTANCE,
  SEARCH_SUMMARY_FIELD,
  SEARCH_SUMMARY_KEYWORD_MAPPING,
  SERVICES_LIST,
  MAP_CATEGORY_TYPES,
};
