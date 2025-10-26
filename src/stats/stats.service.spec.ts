import { StatsService } from "./stats.service";

import type { OccupancyQueryDTO } from "./schemas/occupancy-query.schema";
import type { AverageDurationQueryDTO } from "./schemas/average-duration-query.schema";
import type { TopRoomDTO } from "./schemas/top-rooms.schema";

import type { RoomDTO } from "../rooms/schemas/room.schema";

const createMockStatsRepository = () => ({
  getTotalReservationHours: jest.fn(),
  getAverageDuration: jest.fn(),
  getTopRooms: jest.fn(),
});

const createMockRoomsService = () => ({
  getRoomById: jest.fn(),
});

describe("StatsService", () => {
  const statsRepository = createMockStatsRepository();
  const roomsService = createMockRoomsService();
  const service = new StatsService(statsRepository as never, roomsService as never);

  const room: RoomDTO = {
    id: 1,
    name: "Board Room",
    capacity: 10,
    createdAt: new Date("2024-12-10T09:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOccupancyRate", () => {
    it("should calculate the occupancy percentage when a period is requested", async () => {
      const query: OccupancyQueryDTO = {
        roomId: room.id,
        period: "daily",
        date: "2025-02-01",
      };

      roomsService.getRoomById.mockResolvedValue(room);
      statsRepository.getTotalReservationHours.mockResolvedValue(12);

      const result = await service.getOccupancyRate(query);

      expect(roomsService.getRoomById).toHaveBeenCalledWith(room.id);
      expect(statsRepository.getTotalReservationHours).toHaveBeenCalledWith({
        roomId: room.id,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(result).toEqual({ rate: 50 });
    });
  });

  describe("getAverageDuration", () => {
    it("should delegate the room existence check when a room id is provided", async () => {
      const query: AverageDurationQueryDTO = {
        roomId: room.id,
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      };

      roomsService.getRoomById.mockResolvedValue(room);
      statsRepository.getAverageDuration.mockResolvedValue(90.129);

      const result = await service.getAverageDuration(query);

      expect(roomsService.getRoomById).toHaveBeenCalledWith(room.id);
      expect(statsRepository.getAverageDuration).toHaveBeenCalledWith({
        roomId: room.id,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(result).toEqual({ averageMinutes: 90.13 });
    });

    it("should skip the room lookup when no room id is provided", async () => {
      const query: AverageDurationQueryDTO = {};

      statsRepository.getAverageDuration.mockResolvedValue(45);

      const result = await service.getAverageDuration(query);

      expect(roomsService.getRoomById).not.toHaveBeenCalled();
      expect(statsRepository.getAverageDuration).toHaveBeenCalledWith({
        roomId: undefined,
        startDate: undefined,
        endDate: undefined,
      });
      expect(result).toEqual({ averageMinutes: 45 });
    });
  });

  describe("getTopRooms", () => {
    it("should return the top rooms when they are requested", async () => {
      const topRooms: TopRoomDTO[] = [
        { roomId: 1, name: "Board Room", reservationCount: 5 },
        { roomId: 2, name: "Focus Room", reservationCount: 3 },
      ];

      statsRepository.getTopRooms.mockResolvedValue(topRooms);

      const result = await service.getTopRooms();

      expect(statsRepository.getTopRooms).toHaveBeenCalledWith(3);
      expect(result).toEqual(topRooms);
    });
  });
});
