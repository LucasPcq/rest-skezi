import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe";

import { StatsService } from "./stats.service";

import { occupancyQuerySchema, type OccupancyQueryDTO } from "./schemas/occupancy-query.schema";
import {
  averageDurationQuerySchema,
  type AverageDurationQueryDTO,
} from "./schemas/average-duration-query.schema";

@ApiTags("stats")
@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("occupancy")
  @ApiOperation({ summary: "Get occupancy rate for a specific room" })
  @ApiQuery({ name: "roomId", type: "number", example: 1, description: "Room ID (required)" })
  @ApiQuery({
    name: "period",
    enum: ["daily", "weekly", "monthly"],
    example: "daily",
    description: "Period type (required)",
  })
  @ApiQuery({
    name: "date",
    type: "string",
    example: "2025-10-26",
    description: "Reference date in YYYY-MM-DD format (required)",
  })
  @ApiResponse({
    status: 200,
    description: "Occupancy rate calculated successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            rate: { type: "number", example: 45.83, description: "Occupancy rate as percentage" },
          },
        },
        meta: { type: "object" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation error or invalid period",
  })
  @ApiResponse({
    status: 404,
    description: "Room not found",
  })
  async getOccupancy(@Query(new ZodValidationPipe(occupancyQuerySchema)) query: OccupancyQueryDTO) {
    return this.statsService.getOccupancyRate(query);
  }

  @Get("average-duration")
  @ApiOperation({ summary: "Get average duration of reservations" })
  @ApiQuery({
    name: "roomId",
    type: "number",
    required: false,
    example: 1,
    description: "Filter by room ID (optional)",
  })
  @ApiQuery({
    name: "startDate",
    type: "string",
    required: false,
    example: "2025-01-01",
    description: "Filter from date in YYYY-MM-DD format (optional)",
  })
  @ApiQuery({
    name: "endDate",
    type: "string",
    required: false,
    example: "2025-10-26",
    description: "Filter to date in YYYY-MM-DD format (optional)",
  })
  @ApiResponse({
    status: 200,
    description: "Average duration calculated successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            averageMinutes: {
              type: "number",
              example: 90.5,
              description: "Average duration in minutes",
            },
          },
        },
        meta: { type: "object" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation error or invalid date range",
  })
  @ApiResponse({
    status: 404,
    description: "Room not found (when roomId is provided)",
  })
  async getAverageDuration(
    @Query(new ZodValidationPipe(averageDurationQuerySchema)) query: AverageDurationQueryDTO,
  ) {
    return this.statsService.getAverageDuration(query);
  }

  @Get("top-rooms")
  @ApiOperation({ summary: "Get top 3 rooms by reservation count" })
  @ApiResponse({
    status: 200,
    description: "Top rooms retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              roomId: { type: "number", example: 1 },
              name: { type: "string", example: "Conference Room A" },
              reservationCount: { type: "number", example: 42 },
            },
          },
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "number", example: 3 },
          },
        },
      },
    },
  })
  async getTopRooms() {
    const rooms = await this.statsService.getTopRooms();
    return {
      data: rooms,
      meta: {
        total: rooms.length,
      },
    };
  }
}
