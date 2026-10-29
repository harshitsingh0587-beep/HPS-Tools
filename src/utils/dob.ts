export interface DobCalculationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  dayOfWeek: string;
  nextBirthdayDate: string;
  daysUntilNextBirthday: number;
  isBirthdayToday: boolean;
  isLeapYearBirth: boolean;
  nextBirthdayDayOfWeek: string;
  error?: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function calculateDob(birthDateStr: string, currentDate = new Date()): DobCalculationResult {
  if (!birthDateStr) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalMonths: 0,
      totalHours: 0,
      dayOfWeek: '',
      nextBirthdayDate: '',
      daysUntilNextBirthday: 0,
      isBirthdayToday: false,
      isLeapYearBirth: false,
      nextBirthdayDayOfWeek: '',
      error: 'Please select a valid birth date',
    };
  }

  // Parse YYYY-MM-DD cleanly using local date parts to prevent timezone offsets
  const parts = birthDateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalMonths: 0,
      totalHours: 0,
      dayOfWeek: '',
      nextBirthdayDate: '',
      daysUntilNextBirthday: 0,
      isBirthdayToday: false,
      isLeapYearBirth: false,
      nextBirthdayDayOfWeek: '',
      error: 'Invalid date format',
    };
  }

  const birthYear = parts[0];
  const birthMonth = parts[1] - 1; // 0-indexed
  const birthDay = parts[2];

  const birth = new Date(birthYear, birthMonth, birthDay);

  // Validate real calendar date (e.g. Feb 30 shouldn't rollover silently)
  if (birth.getFullYear() !== birthYear || birth.getMonth() !== birthMonth || birth.getDate() !== birthDay) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalMonths: 0,
      totalHours: 0,
      dayOfWeek: '',
      nextBirthdayDate: '',
      daysUntilNextBirthday: 0,
      isBirthdayToday: false,
      isLeapYearBirth: false,
      nextBirthdayDayOfWeek: '',
      error: 'Invalid calendar date',
    };
  }

  const now = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  if (birth.getTime() > now.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalMonths: 0,
      totalHours: 0,
      dayOfWeek: '',
      nextBirthdayDate: '',
      daysUntilNextBirthday: 0,
      isBirthdayToday: false,
      isLeapYearBirth: false,
      nextBirthdayDayOfWeek: '',
      error: 'Date of birth cannot be in the future',
    };
  }

  // Calculate Years, Months, Days accurately
  let y = now.getFullYear() - birth.getFullYear();
  let m = now.getMonth() - birth.getMonth();
  let d = now.getDate() - birth.getDate();

  if (d < 0) {
    // Days in previous month
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    d += prevMonthLastDay;
    m -= 1;
  }

  if (m < 0) {
    y -= 1;
    m += 12;
  }

  // Total difference in milliseconds
  const diffMs = now.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = y * 12 + m;
  const totalHours = totalDays * 24;

  const dayOfWeek = DAYS_OF_WEEK[birth.getDay()];
  const isLeapYearBirth = isLeapYear(birthYear);

  // Next birthday calculation
  let nextBdayYear = now.getFullYear();
  let nextBday = new Date(nextBdayYear, birthMonth, birthDay);

  // If born Feb 29 and target year is not leap year, celebrate March 1st
  if (birthMonth === 1 && birthDay === 29 && !isLeapYear(nextBdayYear)) {
    nextBday = new Date(nextBdayYear, 2, 1);
  }

  let isBirthdayToday = false;
  if (now.getMonth() === birthMonth && now.getDate() === birthDay) {
    isBirthdayToday = true;
  }

  if (nextBday.getTime() < now.getTime()) {
    nextBdayYear += 1;
    nextBday = new Date(nextBdayYear, birthMonth, birthDay);
    if (birthMonth === 1 && birthDay === 29 && !isLeapYear(nextBdayYear)) {
      nextBday = new Date(nextBdayYear, 2, 1);
    }
  }

  const msToNext = nextBday.getTime() - now.getTime();
  const daysUntilNextBirthday = isBirthdayToday ? 0 : Math.round(msToNext / (1000 * 60 * 60 * 24));
  const nextBirthdayDayOfWeek = DAYS_OF_WEEK[nextBday.getDay()];
  const nextBirthdayFormatted = `${MONTH_NAMES[nextBday.getMonth()]} ${nextBday.getDate()}, ${nextBday.getFullYear()}`;

  return {
    years: y,
    months: m,
    days: d,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    dayOfWeek,
    nextBirthdayDate: nextBirthdayFormatted,
    daysUntilNextBirthday,
    isBirthdayToday,
    isLeapYearBirth,
    nextBirthdayDayOfWeek,
  };
}
