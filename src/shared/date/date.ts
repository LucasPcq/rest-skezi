import { BadRequestException } from "@nestjs/common";

import {
  parse,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
} from "date-fns";

import { fromZonedTime } from "date-fns-tz";

import { OccupancyQueryDTO } from "src/stats/schemas/occupancy-query.schema";

export const DEFAULT_TIMEZONE = "Europe/Paris";
export const ONE_MINUTE_MS = 60 * 1000;
export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;

const FORMAT = {
  DATE: "yyyy-MM-dd",
  DATE_TIME: "yyyy-MM-dd'T'HH:mm:ss",
};

export const formatDateTimeString = (date: string, time: string) => `${date}T${time}:00`;

export const getDateTimeLocal = (date: string) => parse(date, FORMAT.DATE_TIME, new Date());

export const getTimeUTCFromDefaultTimezone = (date: Date) => fromZonedTime(date, DEFAULT_TIMEZONE);

export const validateAndConvertTimeRange = (startTime: Date, endTime: Date) => {
  const startTimeUTC = getTimeUTCFromDefaultTimezone(startTime);
  const endTimeUTC = getTimeUTCFromDefaultTimezone(endTime);

  if (startTimeUTC >= endTimeUTC) {
    throw new BadRequestException({
      code: "INVALID_TIME_RANGE",
      message: "Start time must be before end time.",
    });
  }

  return { startTimeUTC, endTimeUTC };
};

export const parseDateString = (dateString: string): Date => {
  const parsedDate = parse(dateString, FORMAT.DATE, new Date());
  return fromZonedTime(parsedDate, DEFAULT_TIMEZONE);
};

export const parseDateRangeWithBoundaries = (
  startDateStr?: string,
  endDateStr?: string,
): { startDate?: Date; endDate?: Date } => {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr) {
    const parsedStart = parse(startDateStr, FORMAT.DATE, new Date());
    startDate = fromZonedTime(startOfDay(parsedStart), DEFAULT_TIMEZONE);
  }

  if (endDateStr) {
    const parsedEnd = parse(endDateStr, FORMAT.DATE, new Date());
    endDate = fromZonedTime(endOfDay(parsedEnd), DEFAULT_TIMEZONE);
  }

  if (startDate && endDate && startDate > endDate) {
    throw new BadRequestException({
      code: "INVALID_DATE_RANGE",
      message: "Start date must be before or equal to end date.",
    });
  }

  return { startDate, endDate };
};

export const calculatePeriodBounds = (
  referenceDateStr: string,
  period: OccupancyQueryDTO["period"],
): { startDate: Date; endDate: Date; totalAvailableHours: number } => {
  const referenceDate = parseDateString(referenceDateStr);

  let startDate: Date;
  let endDate: Date;
  let totalAvailableHours: number;

  switch (period) {
    case "daily":
      startDate = startOfDay(referenceDate);
      endDate = endOfDay(referenceDate);
      totalAvailableHours = HOURS_PER_DAY;
      break;
    case "weekly":
      startDate = startOfWeek(referenceDate, { weekStartsOn: 1 });
      endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });
      totalAvailableHours = HOURS_PER_DAY * DAYS_PER_WEEK;
      break;
    case "monthly": {
      startDate = startOfMonth(referenceDate);
      endDate = endOfMonth(referenceDate);
      const daysInMonth = getDaysInMonth(referenceDate);
      totalAvailableHours = HOURS_PER_DAY * daysInMonth;
      break;
    }
    default:
      throw new BadRequestException({
        code: "INVALID_PERIOD",
        message: "Period must be daily, weekly, or monthly.",
      });
  }

  return { startDate, endDate, totalAvailableHours };
};
