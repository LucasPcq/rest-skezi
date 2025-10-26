import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import { DATABASE_PROVIDER } from "../db/db.provider";

import { type schema } from "../db/schema";
import { reservations } from "../db/schema/reservations.schema";
import { rooms } from "../db/schema/rooms.schema";

import { TopRoomDTO } from "./schemas/top-rooms.schema";

@Injectable()
export class StatsRepository {
  constructor(@Inject(DATABASE_PROVIDER) private db: NodePgDatabase<typeof schema>) {}

  async getTotalReservationHours({
    roomId,
    startDate,
    endDate,
  }: {
    roomId: number;
    startDate: Date;
    endDate: Date;
  }): Promise<number> {
    const result = await this.db
      .select({
        totalHours: sql<number>`
          COALESCE(
            SUM(
              EXTRACT(EPOCH FROM (
                LEAST(${reservations.endTime}, ${endDate}) -
                GREATEST(${reservations.startTime}, ${startDate})
              )) / 3600
            ),
          0)
        `,
      })
      .from(reservations)
      .where(
        and(
          eq(reservations.roomId, roomId),
          lte(reservations.startTime, endDate),
          gte(reservations.endTime, startDate),
        ),
      );

    return result[0]?.totalHours || 0;
  }

  async getAverageDuration({
    roomId,
    startDate,
    endDate,
  }: {
    roomId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const result = await this.db
      .select({
        avgMinutes: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (
                ${reservations.endTime} - ${reservations.startTime}
              )) / 60
            ),
          0)
        `,
      })
      .from(reservations)
      .where(
        and(
          ...(roomId ? [eq(reservations.roomId, roomId)] : []),
          ...(startDate ? [gte(reservations.endTime, startDate)] : []),
          ...(endDate ? [lte(reservations.startTime, endDate)] : []),
        ),
      );

    return result[0]?.avgMinutes || 0;
  }

  async getTopRooms(limit: number): Promise<TopRoomDTO[]> {
    const reservationsByRooms = await this.db
      .select({
        roomId: reservations.roomId,
        name: rooms.name,
        reservationCount: count(reservations.id),
      })
      .from(reservations)
      .innerJoin(rooms, eq(reservations.roomId, rooms.id))
      .groupBy(reservations.roomId, rooms.name)
      .orderBy(desc(count(reservations.id)))
      .limit(limit);

    return reservationsByRooms;
  }
}
