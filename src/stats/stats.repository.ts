import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { type SQL, and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import { DATABASE_PROVIDER } from "../db/db.provider";

import { type schema } from "../db/schema";
import { reservations } from "../db/schema/reservations.schema";
import { rooms } from "../db/schema/rooms.schema";

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
        totalHours: sql<number>`COALESCE(SUM(EXTRACT(EPOCH FROM (${reservations.endTime} - ${reservations.startTime})) / 3600), 0)`,
      })
      .from(reservations)
      .where(
        and(
          eq(reservations.roomId, roomId),
          gte(reservations.startTime, startDate),
          lte(reservations.endTime, endDate),
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
    const conditions: SQL[] = [];

    if (roomId) {
      conditions.push(eq(reservations.roomId, roomId));
    }

    if (startDate) {
      conditions.push(gte(reservations.startTime, startDate));
    }

    if (endDate) {
      conditions.push(lte(reservations.endTime, endDate));
    }

    const result = await this.db
      .select({
        avgMinutes: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${reservations.endTime} - ${reservations.startTime})) / 60), 0)`,
      })
      .from(reservations)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result[0]?.avgMinutes || 0;
  }

  async getTopRooms(
    limit: number,
  ): Promise<Array<{ roomId: number; name: string; reservationCount: number }>> {
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

    return reservationsByRooms.map((reservation) => ({
      ...reservation,
      reservationCount: Number(reservation.reservationCount),
    }));
  }
}
