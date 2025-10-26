import { Test } from "@nestjs/testing";

import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

import type { OccupancyQueryDTO } from "./schemas/occupancy-query.schema";
import type { AverageDurationQueryDTO } from "./schemas/average-duration-query.schema";
import type { TopRoomDTO } from "./schemas/top-rooms.schema";

describe("StatsController", () => {
  let controller: StatsController;
  let statsService: jest.Mocked<StatsService>;

  beforeEach(async () => {
    statsService = {
      getOccupancyRate: jest.fn(),
      getAverageDuration: jest.fn(),
      getTopRooms: jest.fn(),
    } as unknown as jest.Mocked<StatsService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: statsService }],
    }).compile();

    controller = moduleRef.get(StatsController);
  });

  describe("getOccupancy", () => {
    it("should return occupancy data when requested", async () => {
      const query: OccupancyQueryDTO = { roomId: 1, period: "daily", date: "2025-02-01" };
      statsService.getOccupancyRate.mockResolvedValue({ rate: 37.5 });

      const result = await controller.getOccupancy(query);

      expect(result).toEqual({ rate: 37.5 });
      expect(statsService.getOccupancyRate).toHaveBeenCalledWith(query);
    });
  });

  describe("getAverageDuration", () => {
    it("should return average duration data when requested", async () => {
      const query: AverageDurationQueryDTO = { roomId: 1 };
      statsService.getAverageDuration.mockResolvedValue({ averageMinutes: 90 });

      const result = await controller.getAverageDuration(query);

      expect(result).toEqual({ averageMinutes: 90 });
      expect(statsService.getAverageDuration).toHaveBeenCalledWith(query);
    });
  });

  describe("getTopRooms", () => {
    it("should wrap top rooms in an envelope when returning the ranking", async () => {
      const topRooms: TopRoomDTO[] = [
        { roomId: 1, name: "Board Room", reservationCount: 5 },
        { roomId: 2, name: "Focus Room", reservationCount: 3 },
      ];

      statsService.getTopRooms.mockResolvedValue(topRooms);

      const result = await controller.getTopRooms();

      expect(result).toEqual({
        data: topRooms,
        meta: { total: topRooms.length },
      });
      expect(statsService.getTopRooms).toHaveBeenCalledTimes(1);
    });
  });
});
