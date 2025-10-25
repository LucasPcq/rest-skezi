import { BadRequestException, Injectable } from "@nestjs/common";
import { parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import type { ReservationDTO } from "./schemas/reservation.schema";
import type { CreateReservationDTO } from "./schemas/create-reservation.schema";

import { RoomsService } from "../rooms/rooms.service";

import { ReservationsRepository } from "./reservations.repository";

const DEFAULT_TIMEZONE = "Europe/Paris";
const ONE_MINUTE_MS = 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async createReservation(data: CreateReservationDTO): Promise<ReservationDTO> {
    const startTime = parseISO(data.startTime);
    const endTime = parseISO(data.endTime);

    const startTimeUTC = fromZonedTime(startTime, DEFAULT_TIMEZONE);
    const endTimeUTC = fromZonedTime(endTime, DEFAULT_TIMEZONE);

    if (startTimeUTC >= endTimeUTC) {
      throw new BadRequestException({
        code: "INVALID_TIME_RANGE",
        message: "Start time must be before end time.",
      });
    }

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

    const hasOverlap = await this.reservationsRepository.hasOverlap({
      roomId: room.id,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
    });

    if (hasOverlap) {
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
