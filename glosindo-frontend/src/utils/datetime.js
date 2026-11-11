import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('id');

/**
 * Server timezone (backend)
 */
export const SERVER_TIMEZONE = 'Asia/Jakarta';

/**
 * Parse datetime string into Asia/Jakarta dayjs instance.
 * - Strings with explicit offset/UTC ("...Z", "+07:00") are converted to Asia/Jakarta.
 * - Naive SQL strings without timezone ("2024-08-21 14:30:00") are treated as Asia/Jakarta.
 */
const toServerDayjs = (dateString) => {
  if (!dateString) return null;

  if (typeof dateString === 'string') {
    const trimmed = dateString.trim();
    const hasExplicitTz = /(Z|[+-]\d{2}:?\d{2}|GMT)$/i.test(trimmed);
    return hasExplicitTz ? dayjs(trimmed).tz(SERVER_TIMEZONE) : dayjs.tz(trimmed, SERVER_TIMEZONE);
  }

  return dayjs(dateString).tz(SERVER_TIMEZONE);
};

/**
 * Format datetime from server in Asia/Jakarta
 */
export const formatServerDate = (dateString, format = 'DD MMM YYYY HH:mm') => {
  if (!dateString) return '-';

  return toServerDayjs(dateString).format(format);
};

/**
 * Format datetime to display in user's local timezone
 */
export const formatLocalDate = (dateString, format = 'DD MMM YYYY HH:mm') => {
  if (!dateString) return '-';
  
  return dayjs(dateString).format(format);
};

/**
 * Convert local datetime to server timezone for API submission
 * Use this when sending datetime to backend
 */
export const toServerTimezone = (localDate) => {
  if (!localDate) return null;
  
  return dayjs(localDate).tz(SERVER_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Parse server datetime string to Date object
 */
export const parseServerDate = (dateString) => {
  if (!dateString) return null;

  return toServerDayjs(dateString).toDate();
};

/**
 * Get relative time (e.g., "2 jam yang lalu")
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '-';

  return toServerDayjs(dateString).fromNow();
};

/**
 * Format date only (no time)
 */
export const formatDate = (dateString) => {
  return formatServerDate(dateString, 'DD MMMM YYYY');
};

/**
 * Format time only
 */
export const formatTime = (dateString) => {
  return formatServerDate(dateString, 'HH:mm');
};

/**
 * Format datetime for display in tables (compact)
 */
export const formatCompactDatetime = (dateString) => {
  return formatServerDate(dateString, 'DD/MM/YY HH:mm');
};

/**
 * Check if date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;

  const date = toServerDayjs(dateString);
  const today = dayjs().tz(SERVER_TIMEZONE);

  return date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');
};

/**
 * Calculate duration between two dates (in minutes)
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = toServerDayjs(startDate);
  const end = toServerDayjs(endDate);

  return end.diff(start, 'minute');
};

/**
 * Format duration in human-readable format
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '-';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours} jam ${mins} menit`;
  }
  
  return `${mins} menit`;
};

/**
 * Get current datetime in server timezone (for forms)
 */
export const getCurrentServerTime = () => {
  return dayjs().tz(SERVER_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Format date for input[type="date"]
 */
export const formatInputDate = (dateString) => {
  if (!dateString) return '';
  return toServerDayjs(dateString).format('YYYY-MM-DD');
};

/**
 * Format time for input[type="time"]
 */
export const formatInputTime = (dateString) => {
  if (!dateString) return '';
  return toServerDayjs(dateString).format('HH:mm');
};

export default {
  SERVER_TIMEZONE,
  formatServerDate,
  formatLocalDate,
  toServerTimezone,
  parseServerDate,
  getRelativeTime,
  formatDate,
  formatTime,
  formatCompactDatetime,
  isToday,
  calculateDuration,
  formatDuration,
  getCurrentServerTime,
  formatInputDate,
  formatInputTime,
};
