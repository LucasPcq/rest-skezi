import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import type { EnvelopeResponse } from "../shared/interceptors/envelope.interceptor";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe";

import { RoomsService } from "./rooms.service";

import { createRoomSchema, type CreateRoomDTO } from "./schemas/create-room.schema";
import { roomIdSchema } from "./schemas/room-id.schema";
import type { RoomDTO } from "./schemas/room.schema";

@ApiTags("rooms")
@Controller("rooms")
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createRoomSchema))
  @ApiOperation({ summary: "Create a new room" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Conference Room A" },
        capacity: { type: "number", example: 10 },
      },
      required: ["name", "capacity"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Room created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation error or room name already exists",
  })
  async createRoom(@Body() createRoomDto: CreateRoomDTO) {
    const room = await this.roomsService.createRoom(createRoomDto);
    return room;
  }

  @Get()
  @ApiOperation({ summary: "Get all rooms" })
  @ApiResponse({
    status: 200,
    description: "List of all rooms",
  })
  async getAllRooms(): Promise<EnvelopeResponse<RoomDTO[]>> {
    const rooms = await this.roomsService.getAllRooms();
    return {
      data: rooms,
      meta: {
        total: rooms.length,
      },
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a room by ID" })
  @ApiParam({ name: "id", type: "number", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Room found",
  })
  @ApiResponse({
    status: 404,
    description: "Room not found",
  })
  async getRoomById(@Param(new ZodValidationPipe(roomIdSchema)) params: { id: number }) {
    const room = await this.roomsService.getRoomById(params.id);
    return room;
  }
}
