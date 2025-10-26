import { ReservationsService } from "./reservations.service";

import type { ReservationDTO } from "./schemas/reservation.schema";
import type { CreateReservationDTO } from "./schemas/create-reservation.schema";

import type { RoomDTO } from "../rooms/schemas/room.schema";

const createMockRoomsService = () => ({
  getRoomById: jest.fn(),
});

const createMockReservationQueriesService = () => ({
  findOverlappingReservations: jest.fn(),
});

const createMockReservationsRepository = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByRoomId: jest.fn(),
});

describe("ReservationsService", () => {
  const roomsService = createMockRoomsService();
  const reservationQueriesService = createMockReservationQueriesService();
  const reservationsRepository = createMockReservationsRepository();
  const service = new ReservationsService(
    roomsService as never,
    reservationQueriesService as never,
    reservationsRepository as never,
  );

  const baseDate = new Date("2025-01-01T00:00:00Z");
  const room: RoomDTO = {
    id: 1,
    name: "Focus Room",
    capacity: 6,
    createdAt: new Date("2024-12-01T10:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(baseDate);
  });

  describe("createReservation", () => {
    const payload: CreateReservationDTO = {
      roomId: room.id,
      startTime: "2025-01-02T09:00:00+01:00",
      endTime: "2025-01-02T10:00:00+01:00",
    };

    it("should persist a reservation when all validations pass", async () => {
      roomsService.getRoomById.mockResolvedValue(room);
      reservationQueriesService.findOverlappingReservations.mockResolvedValue([]);

      const reservation: ReservationDTO = {
        id: 10,
        roomId: room.id,
        startTime: new Date("2025-01-02T08:00:00Z"),
        endTime: new Date("2025-01-02T09:00:00Z"),
        createdAt: new Date("2025-01-01T12:00:00Z"),
      };

      reservationsRepository.create.mockResolvedValue(reservation);

      const result = await service.createReservation(payload);

      expect(roomsService.getRoomById).toHaveBeenCalledWith(room.id);
      expect(reservationQueriesService.findOverlappingReservations).toHaveBeenCalledWith({
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        roomIds: [room.id],
      });
      expect(reservationsRepository.create).toHaveBeenCalledWith({
        roomId: room.id,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      });
      expect(result).toEqual(reservation);
    });

    it("should reject a reservation when its duration is shorter than one minute", async () => {
      const invalidPayload: CreateReservationDTO = {
        roomId: room.id,
        startTime: "2025-01-02T09:00:00+01:00",
        endTime: "2025-01-02T09:00:30+01:00",
      };

      await expect(service.createReservation(invalidPayload)).rejects.toMatchObject({
        response: {
          code: "DURATION_TOO_SHORT",
          message: "Reservation duration must be at least 1 minute.",
        },
      });
    });

    it("should reject a reservation when its duration exceeds twenty four hours", async () => {
      const invalidPayload: CreateReservationDTO = {
        roomId: room.id,
        startTime: "2025-01-02T09:00:00+01:00",
        endTime: "2025-01-03T10:00:01+01:00",
      };

      await expect(service.createReservation(invalidPayload)).rejects.toMatchObject({
        response: {
          code: "DURATION_TOO_LONG",
          message: "Reservation duration cannot exceed 24 hours.",
        },
      });
    });

    it("should reject a reservation when it is scheduled in the past", async () => {
      const invalidPayload: CreateReservationDTO = {
        roomId: room.id,
        startTime: "2024-12-30T09:00:00+01:00",
        endTime: "2024-12-30T10:00:00+01:00",
      };

      await expect(service.createReservation(invalidPayload)).rejects.toMatchObject({
        response: {
          code: "RESERVATION_IN_PAST",
          message: "Cannot create reservations in the past.",
        },
      });
    });

    it("should reject a reservation when reservations overlap", async () => {
      roomsService.getRoomById.mockResolvedValue(room);
      reservationQueriesService.findOverlappingReservations.mockResolvedValue([
        {
          id: 99,
          roomId: room.id,
          startTime: new Date("2025-01-02T08:30:00Z"),
          endTime: new Date("2025-01-02T09:30:00Z"),
          createdAt: new Date("2025-01-01T08:00:00Z"),
        },
      ]);

      await expect(service.createReservation(payload)).rejects.toMatchObject({
        response: {
          code: "RESERVATION_OVERLAP",
          message: "The room is already reserved for this time slot.",
        },
      });
    });

    it("should propagate an error when the repository fails to create the reservation", async () => {
      roomsService.getRoomById.mockResolvedValue(room);
      reservationQueriesService.findOverlappingReservations.mockResolvedValue([]);
      reservationsRepository.create.mockResolvedValue(null);

      await expect(service.createReservation(payload)).rejects.toMatchObject({
        response: {
          code: "RESERVATION_CREATION_FAILED",
          message: "Failed to create reservation due to an unknown error.",
        },
      });
    });
  });

  describe("getAllReservations", () => {
    it("should return every reservation when fetching all reservations", async () => {
      const reservations: ReservationDTO[] = [
        {
          id: 1,
          roomId: room.id,
          startTime: new Date("2025-01-02T08:00:00Z"),
          endTime: new Date("2025-01-02T09:00:00Z"),
          createdAt: new Date("2025-01-01T12:00:00Z"),
        },
      ];

      reservationsRepository.findAll.mockResolvedValue(reservations);

      const result = await service.getAllReservations();

      expect(result).toEqual(reservations);
      expect(reservationsRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getReservationsByRoomId", () => {
    it("should ensure the room exists when retrieving reservations by room id", async () => {
      const reservations: ReservationDTO[] = [];
      roomsService.getRoomById.mockResolvedValue(room);
      reservationsRepository.findByRoomId.mockResolvedValue(reservations);

      const result = await service.getReservationsByRoomId(room.id);

      expect(roomsService.getRoomById).toHaveBeenCalledWith(room.id);
      expect(reservationsRepository.findByRoomId).toHaveBeenCalledWith(room.id);
      expect(result).toEqual(reservations);
    });
  });
});
