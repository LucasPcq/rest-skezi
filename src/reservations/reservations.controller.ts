import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import type { EnvelopeResponse } from "../shared/interceptors/envelope.interceptor";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe";

import { roomIdSchema } from "../rooms/schemas/room-id.schema";

import {
  createReservationSchema,
  type CreateReservationDTO,
} from "./schemas/create-reservation.schema";
import type { ReservationDTO } from "./schemas/reservation.schema";

import { ReservationsService } from "./reservations.service";

@ApiTags("reservations")
@Controller("reservations")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createReservationSchema))
  @ApiOperation({ summary: "Create a new reservation" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        roomId: { type: "number", example: 1 },
        startTime: { type: "string", format: "date-time", example: "2025-10-26T10:00:00+02:00" },
        endTime: { type: "string", format: "date-time", example: "2025-10-26T12:00:00+02:00" },
      },
      required: ["roomId", "startTime", "endTime"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Reservation created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation error, overlap, invalid time range, etc.",
  })
  @ApiResponse({
    status: 404,
    description: "Room not found",
  })
  async createReservation(@Body() createReservationDto: CreateReservationDTO) {
    const reservation = await this.reservationsService.createReservation(createReservationDto);
    return reservation;
  }

  @Get()
  @ApiOperation({ summary: "Get all reservations" })
  @ApiResponse({
    status: 200,
    description: "List of all reservations",
  })
  async getAllReservations(): Promise<EnvelopeResponse<ReservationDTO[]>> {
    const reservations = await this.reservationsService.getAllReservations();
    return {
      data: reservations,
      meta: {
        total: reservations.length,
      },
    };
  }

  @Get("room/:id")
  @ApiOperation({ summary: "Get all reservations for a specific room" })
  @ApiParam({ name: "id", type: "number", example: 1 })
  @ApiResponse({
    status: 200,
    description: "List of reservations for the room",
  })
  @ApiResponse({
    status: 404,
    description: "Room not found",
  })
  async getReservationsByRoomId(
    @Param(new ZodValidationPipe(roomIdSchema)) params: { id: number },
  ): Promise<EnvelopeResponse<ReservationDTO[]>> {
    const reservations = await this.reservationsService.getReservationsByRoomId(params.id);
    return {
      data: reservations,
      meta: {
        total: reservations.length,
      },
    };
  }
}
