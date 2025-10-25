import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import type { RoomDTO } from "./schemas/room.schema";
import type { CreateRoomDTO } from "./schemas/create-room.schema";
import type { AvailabilityQueryDTO } from "./schemas/availability-query.schema";

import { ReservationQueriesService } from "../shared/reservation-queries/reservation-queries.service";
import { RoomsRepository } from "./rooms.repository";

import {
  getDateTimeLocal,
  formatDateTimeString,
  validateAndConvertTimeRange,
} from "../shared/date/date";

@Injectable()
export class RoomsService {
  constructor(
    private readonly reservationQueriesService: ReservationQueriesService,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  async createRoom(data: CreateRoomDTO): Promise<RoomDTO> {
    const room = await this.roomsRepository.create(data);

    if (!room) {
      throw new BadRequestException({
        code: "ROOM_NAME_ALREADY_EXISTS",
        message: "A room with this name already exists.",
      });
    }

    return room;
  }

  async getAllRooms(): Promise<RoomDTO[]> {
    const rooms = await this.roomsRepository.findAll();
    return rooms;
  }

  async getRoomById(roomId: number): Promise<RoomDTO> {
    const room = await this.roomsRepository.findById(roomId);

    if (!room) {
      throw new NotFoundException({
        code: "ROOM_NOT_FOUND",
        message: "The specified room does not exist.",
      });
    }

    return room;
  }

  async getAvailableRooms({
    date,
    startTime,
    endTime,
    roomIds,
  }: AvailabilityQueryDTO): Promise<RoomDTO[]> {
    const startDateTimeStr = formatDateTimeString(date, startTime);
    const endDateTimeStr = formatDateTimeString(date, endTime);

    const startTimeLocal = getDateTimeLocal(startDateTimeStr);
    const endTimeLocal = getDateTimeLocal(endDateTimeStr);

    const { startTimeUTC, endTimeUTC } = validateAndConvertTimeRange(startTimeLocal, endTimeLocal);

    const overlappingReservations =
      await this.reservationQueriesService.findOverlappingReservations({
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        roomIds,
      });

    const unavailableRoomIds = overlappingReservations.map((r) => r.roomId);

    const rooms = await this.roomsRepository.findAvailableRooms({
      roomIds,
      unavailableRoomIds,
    });

    return rooms;
  }
}
