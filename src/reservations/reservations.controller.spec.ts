import { Test } from "@nestjs/testing";

import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";

import type { CreateReservationDTO } from "./schemas/create-reservation.schema";
import type { ReservationDTO } from "./schemas/reservation.schema";

describe("ReservationsController", () => {
  let controller: ReservationsController;
  let reservationsService: jest.Mocked<ReservationsService>;

  const reservation: ReservationDTO = {
    id: 1,
    roomId: 1,
    startTime: new Date("2025-01-02T08:00:00Z"),
    endTime: new Date("2025-01-02T09:00:00Z"),
    createdAt: new Date("2025-01-01T12:00:00Z"),
  };

  beforeEach(async () => {
    reservationsService = {
      createReservation: jest.fn(),
      getAllReservations: jest.fn(),
      getReservationsByRoomId: jest.fn(),
    } as unknown as jest.Mocked<ReservationsService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: reservationsService }],
    }).compile();

    controller = moduleRef.get(ReservationsController);
  });

  describe("createReservation", () => {
    it("should relay reservation creation to the service when handling a creation request", async () => {
      const dto: CreateReservationDTO = {
        roomId: 1,
        startTime: "2025-01-02T09:00:00+01:00",
        endTime: "2025-01-02T10:00:00+01:00",
      };

      reservationsService.createReservation.mockResolvedValue(reservation);

      const result = await controller.createReservation(dto);

      expect(result).toEqual(reservation);
      expect(reservationsService.createReservation).toHaveBeenCalledWith(dto);
    });
  });

  describe("getAllReservations", () => {
    it("should return an envelope when listing reservations", async () => {
      reservationsService.getAllReservations.mockResolvedValue([reservation]);

      const result = await controller.getAllReservations();

      expect(result).toEqual({
        data: [reservation],
        meta: { total: 1 },
      });
    });
  });

  describe("getReservationsByRoomId", () => {
    it("should wrap room reservations in an envelope when fetching by room id", async () => {
      reservationsService.getReservationsByRoomId.mockResolvedValue([reservation]);

      const result = await controller.getReservationsByRoomId({ id: reservation.roomId });

      expect(reservationsService.getReservationsByRoomId).toHaveBeenCalledWith(reservation.roomId);
      expect(result).toEqual({
        data: [reservation],
        meta: { total: 1 },
      });
    });
  });
});
