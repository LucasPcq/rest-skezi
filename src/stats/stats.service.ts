import { Injectable } from "@nestjs/common";

import { RoomsService } from "../rooms/rooms.service";
import { StatsRepository } from "./stats.repository";

import type { OccupancyQueryDTO } from "./schemas/occupancy-query.schema";
import type { AverageDurationQueryDTO } from "./schemas/average-duration-query.schema";

import { calculatePeriodBounds, parseDateRangeWithBoundaries } from "../shared/date/date";

@Injectable()
export class StatsService {
  constructor(
    private readonly statsRepository: StatsRepository,
    private readonly roomsService: RoomsService,
  ) {}

  async getOccupancyRate(query: OccupancyQueryDTO): Promise<{ rate: number }> {
    await this.roomsService.getRoomById(query.roomId);

    const { startDate, endDate, totalAvailableHours } = calculatePeriodBounds(
      query.date,
      query.period,
    );

    const reservedHours = await this.statsRepository.getTotalReservationHours({
      roomId: query.roomId,
      startDate,
      endDate,
    });

    const rate = (reservedHours / totalAvailableHours) * 100;

    return {
      rate: Math.round(rate * 100) / 100,
    };
  }

  async getAverageDuration(query: AverageDurationQueryDTO): Promise<{ averageMinutes: number }> {
    if (query.roomId) {
      await this.roomsService.getRoomById(query.roomId);
    }

    const { startDate, endDate } = parseDateRangeWithBoundaries(query.startDate, query.endDate);

    const avgMinutes = await this.statsRepository.getAverageDuration({
      roomId: query.roomId,
      startDate,
      endDate,
    });

    return {
      averageMinutes: Math.round(avgMinutes * 100) / 100,
    };
  }

  async getTopRooms(): Promise<Array<{ roomId: number; name: string; reservationCount: number }>> {
    return this.statsRepository.getTopRooms(3);
  }
}
