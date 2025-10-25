import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import type { CreateRoomDTO } from "./schemas/create-room.schema";
import type { RoomDTO } from "./schemas/room.schema";

import { RoomsRepository } from "./rooms.repository";

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

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
}
