import { vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { RoomsService } from "./rooms.service";

import type { RoomDTO } from "./schemas/room.schema";
import type { AvailabilityQueryDTO } from "./schemas/availability-query.schema";
import type { CreateRoomDTO } from "./schemas/create-room.schema";

import type { Reservation } from "../db/schema/reservations.schema";

const createMockRoomsRepository = () => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findAvailableRooms: vi.fn(),
});

const createMockReservationQueriesService = () => ({
  findOverlappingReservations: vi.fn(),
});

describe("RoomsService", () => {
  const reservationQueriesService = createMockReservationQueriesService();
  const roomsRepository = createMockRoomsRepository();
  const service = new RoomsService(reservationQueriesService as never, roomsRepository as never);

  const room: RoomDTO = {
    id: 1,
    name: "Alpha",
    capacity: 10,
    createdAt: new Date("2025-01-01T10:00:00Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRoom", () => {
    it("should return the created room when the repository succeeds", async () => {
      const payload: CreateRoomDTO = { name: "Beta", capacity: 8 };
      roomsRepository.create.mockResolvedValue({ ...room, ...payload });

      const result = await service.createRoom(payload);

      expect(result).toEqual({ ...room, ...payload });
      expect(roomsRepository.create).toHaveBeenCalledWith(payload);
    });

    it("should throw a BadRequestException when the repository reports a duplicate name", async () => {
      roomsRepository.create.mockResolvedValue(null);

      await expect(service.createRoom({ name: "Alpha", capacity: 4 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe("getAllRooms", () => {
    it("should return every room when fetching all rooms", async () => {
      roomsRepository.findAll.mockResolvedValue([room]);

      const result = await service.getAllRooms();

      expect(result).toEqual([room]);
      expect(roomsRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getRoomById", () => {
    it("should return a room when the repository finds it", async () => {
      roomsRepository.findById.mockResolvedValue(room);

      const result = await service.getRoomById(1);

      expect(result).toEqual(room);
      expect(roomsRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should throw a NotFoundException when the room does not exist", async () => {
      roomsRepository.findById.mockResolvedValue(null);

      await expect(service.getRoomById(42)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("getAvailableRooms", () => {
    it("should filter out rooms when there are overlapping reservations", async () => {
      const overlappingReservation: Reservation = {
        id: 7,
        roomId: 2,
        startTime: new Date("2025-03-01T08:00:00Z"),
        endTime: new Date("2025-03-01T10:00:00Z"),
        createdAt: new Date("2025-02-01T08:00:00Z"),
      };

      reservationQueriesService.findOverlappingReservations.mockResolvedValue([
        overlappingReservation,
      ]);

      const availableRoom: RoomDTO = {
        id: 1,
        name: "Open Space",
        capacity: 12,
        createdAt: new Date("2025-01-02T08:00:00Z"),
      };

      roomsRepository.findAvailableRooms.mockResolvedValue([availableRoom]);

      const query: AvailabilityQueryDTO = {
        date: "2025-03-01",
        startTime: "09:00",
        endTime: "11:00",
        roomIds: [1, 2],
      };

      const result = await service.getAvailableRooms(query);

      expect(reservationQueriesService.findOverlappingReservations).toHaveBeenCalledWith({
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        roomIds: query.roomIds,
      });

      expect(roomsRepository.findAvailableRooms).toHaveBeenCalledWith({
        roomIds: query.roomIds,
        unavailableRoomIds: [overlappingReservation.roomId],
      });

      expect(result).toEqual([availableRoom]);
    });
  });
});
