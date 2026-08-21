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
 * Format datetime from server (always treat as Asia/Jakarta)
 * Server sends: "2024-08-21 14:30:00" (implicitly Asia/Jakarta)
 */
export const formatServerDate = (dateString, format = 'DD MMM YYYY HH:mm') => {
  if (!dateString) return '-';
  
  return dayjs.tz(dateString, SERVER_TIMEZONE).format(format);
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
  
  return dayjs.tz(dateString, SERVER_TIMEZONE).toDate();
};

/**
 * Get relative time (e.g., "2 jam yang lalu")
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  return dayjs.tz(dateString, SERVER_TIMEZONE).fromNow();
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
  
  const date = dayjs.tz(dateString, SERVER_TIMEZONE);
  const today = dayjs().tz(SERVER_TIMEZONE);
  
  return date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');
};

/**
 * Calculate duration between two dates (in minutes)
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  const start = dayjs.tz(startDate, SERVER_TIMEZONE);
  const end = dayjs.tz(endDate, SERVER_TIMEZONE);
  
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
  return dayjs.tz(dateString, SERVER_TIMEZONE).format('YYYY-MM-DD');
};

/**
 * Format time for input[type="time"]
 */
export const formatInputTime = (dateString) => {
  if (!dateString) return '';
  return dayjs.tz(dateString, SERVER_TIMEZONE).format('HH:mm');
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
