import { format, subDays, addDays, differenceInDays, startOfDay, getDay } from 'date-fns';

const DEFAULT_DAY_START_HOUR = 4; // 4 AM default

/**
 * Get the logical date based on day start hour
 * If current time is before the day start hour, returns previous day
 * @param date The date to get logical date for (defaults to now)
 * @param dayStartHour The hour that defines start of day (defaults to 4 AM)
 */
export function getLogicalDate(date: Date = new Date(), dayStartHour: number = DEFAULT_DAY_START_HOUR): Date {
  const hour = date.getHours();
  if (hour < dayStartHour) {
    return startOfDay(subDays(date, 1));
  }
  return startOfDay(date);
}

export function getLogicalDateString(date: Date = new Date(), dayStartHour: number = DEFAULT_DAY_START_HOUR): string {
  return format(getLogicalDate(date, dayStartHour), 'yyyy-MM-dd');
}

export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d');
}

export function getDayOfWeek(date: Date = new Date(), dayStartHour: number = DEFAULT_DAY_START_HOUR): number {
  return getDay(getLogicalDate(date, dayStartHour)); // 0 = Sunday, 6 = Saturday
}

export function isHabitDueToday(frequencyDays: number[], date: Date = new Date(), dayStartHour: number = DEFAULT_DAY_START_HOUR): boolean {
  const dayOfWeek = getDayOfWeek(date, dayStartHour);
  return frequencyDays.includes(dayOfWeek);
}

export function getHorizonDates(date: Date = new Date(), dayStartHour: number = DEFAULT_DAY_START_HOUR): { start: Date; end: Date } {
  const logicalDate = getLogicalDate(date, dayStartHour);
  return {
    start: logicalDate,
    end: addDays(logicalDate, 3),
  };
}

export function getDaysUntil(targetDate: string | Date, fromDate: Date = new Date(), dayStartHour: number = DEFAULT_DAY_START_HOUR): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const logical = getLogicalDate(fromDate, dayStartHour);
  return differenceInDays(startOfDay(target), logical);
}

export function isOverdue(dueDate: string | Date, fromDate: Date = new Date()): boolean {
  return getDaysUntil(dueDate, fromDate) < 0;
}

export function isDueToday(dueDate: string | Date, fromDate: Date = new Date()): boolean {
  return getDaysUntil(dueDate, fromDate) === 0;
}

export function isDueSoon(dueDate: string | Date, fromDate: Date = new Date()): boolean {
  const days = getDaysUntil(dueDate, fromDate);
  return days > 0 && days <= 3;
}
