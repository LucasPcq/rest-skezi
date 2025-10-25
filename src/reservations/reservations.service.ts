import { BadRequestException, Injectable } from "@nestjs/common";
import { parseISO } from "date-fns";

import type { ReservationDTO } from "./schemas/reservation.schema";
import type { CreateReservationDTO } from "./schemas/create-reservation.schema";

import { RoomsService } from "../rooms/rooms.service";
import { ReservationQueriesService } from "../shared/reservation-queries/reservation-queries.service";

import { ReservationsRepository } from "./reservations.repository";

import {
  ONE_MINUTE_MS,
  TWENTY_FOUR_HOURS_MS,
  validateAndConvertTimeRange,
} from "src/shared/date/date";

@Injectable()
export class ReservationsService {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly reservationQueriesService: ReservationQueriesService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async createReservation(data: CreateReservationDTO): Promise<ReservationDTO> {
    const startTime = parseISO(data.startTime);
    const endTime = parseISO(data.endTime);

    const { startTimeUTC, endTimeUTC } = validateAndConvertTimeRange(startTime, endTime);

    const durationMs = endTimeUTC.getTime() - startTimeUTC.getTime();

    if (durationMs < ONE_MINUTE_MS) {
      throw new BadRequestException({
        code: "DURATION_TOO_SHORT",
        message: "Reservation duration must be at least 1 minute.",
      });
    }

    if (durationMs > TWENTY_FOUR_HOURS_MS) {
      throw new BadRequestException({
        code: "DURATION_TOO_LONG",
        message: "Reservation duration cannot exceed 24 hours.",
      });
    }

    const now = new Date();

    if (startTimeUTC < now) {
      throw new BadRequestException({
        code: "RESERVATION_IN_PAST",
        message: "Cannot create reservations in the past.",
      });
    }

    const room = await this.roomsService.getRoomById(data.roomId);

    const overlappingReservations =
      await this.reservationQueriesService.findOverlappingReservations({
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        roomIds: [room.id],
      });

    if (overlappingReservations.length > 0) {
      throw new BadRequestException({
        code: "RESERVATION_OVERLAP",
        message: "The room is already reserved for this time slot.",
      });
    }

    const reservation = await this.reservationsRepository.create({
      roomId: room.id,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
    });

    if (!reservation) {
      throw new BadRequestException({
        code: "RESERVATION_CREATION_FAILED",
        message: "Failed to create reservation due to an unknown error.",
      });
    }

    return reservation;
  }

  async getAllReservations(): Promise<ReservationDTO[]> {
    const reservations = await this.reservationsRepository.findAll();
    return reservations;
  }

  async getReservationsByRoomId(roomId: number): Promise<ReservationDTO[]> {
    const room = await this.roomsService.getRoomById(roomId);

    const reservations = await this.reservationsRepository.findByRoomId(room.id);
    return reservations;
  }
}
