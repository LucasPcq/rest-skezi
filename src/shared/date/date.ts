import { BadRequestException } from "@nestjs/common";

import { parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "Europe/Paris";
export const ONE_MINUTE_MS = 60 * 1000;
export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const formatDateTimeString = (date: string, time: string) => `${date}T${time}:00`;

export const getDateTimeLocal = (date: string) => parse(date, "yyyy-MM-dd'T'HH:mm:ss", new Date());

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
