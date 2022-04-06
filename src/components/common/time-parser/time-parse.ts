import { DayPeriod } from '@shelter/core/dist';
const SECOND_TIME_PER_DAY = 86400;

const days = {
  [DayPeriod.Monday]: 0,
  [DayPeriod.Tuesday]: SECOND_TIME_PER_DAY * 1,
  [DayPeriod.Wednesday]: SECOND_TIME_PER_DAY * 2,
  [DayPeriod.Thursday]: SECOND_TIME_PER_DAY * 3,
  [DayPeriod.Friday]: SECOND_TIME_PER_DAY * 4,
  [DayPeriod.Saturday]: SECOND_TIME_PER_DAY * 5,
  [DayPeriod.Sunday]: SECOND_TIME_PER_DAY * 6,
};

// * Time is HH:MM AA
const parseTimeStrToNormalTime = (timeStr) => {
  const [hourMin, temp] = timeStr.split(' ');
  const bonus = temp === 'PM' ? 12 : 0;
  const [defaultHour, min] = hourMin.split(':');

  const hour = defaultHour === '12' ? '0' : defaultHour;
  return `${+hour + bonus}:${+min}`;
};

// * Time is HH:MM
const parseTimeToSeconds = (day: string, timeStr: string, isStandard = false) => {
  console.log('@parseTimeToSeconds', day, timeStr, isStandard);
  const time = !isStandard ? parseTimeStrToNormalTime(timeStr) : timeStr;
  const [hour = 0, min = 0] = time.split(':');

  return days[day] + (+hour * 60 * 60) + (+min * 60); // * Return seconds
};

function parseSecondsToHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);

  const hDisplay = h > 0 ? h : 0;
  const mDisplay = m > 0 ? m : 0;
  // tslint:disable-next-line:no-nested-template-literals
  return `${hDisplay < 10 ? `0${hDisplay}` : hDisplay}:${mDisplay < 10 ? `0${mDisplay}` : `${mDisplay}` }`;
}

// * Start week from Monday
const getTotalWeeksInMonth = (year: number, month: number) => {
  const first = new Date(year, month, 1).getDay();
  const last = 32 - new Date(year, month, 32).getDate();

  // logic to calculate number of weeks for the current month
  return Math.ceil((first + last) / 7);
};

// * Get current index of week in a specific month
const getCurrentWeekIndex = (theDate) => {
  const date = new Date(theDate);
  const first = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const last = theDate.getDate();

  // logic to calculate current index of weeks for the current month
  return Math.ceil((first + last) / 7);
};


function formatDate(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getDate() + "/" + (+date.getMonth()+1) + "/" + date.getFullYear() + " " + strTime;
}
export {
  parseTimeToSeconds,
  parseSecondsToHours,
  getTotalWeeksInMonth,
  getCurrentWeekIndex,
  formatDate,
};
