import { Inject, Injectable } from "@nestjs/common";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq, gte, lte } from "drizzle-orm";

import { DATABASE_PROVIDER } from "src/db/db.provider";

import { type schema } from "../db/schema";
import { NewReservation, Reservation, reservations } from "src/db/schema/reservations.schema";

@Injectable()
export class ReservationsRepository {
  constructor(@Inject(DATABASE_PROVIDER) private db: NodePgDatabase<typeof schema>) {}

  async create(data: NewReservation): Promise<Reservation | null> {
    const result = await this.db.insert(reservations).values(data).returning();
    return result[0] || null;
  }

  async findAll(): Promise<Reservation[]> {
    return this.db.select().from(reservations);
  }

  async findByRoomId(roomId: number): Promise<Reservation[]> {
    return this.db.select().from(reservations).where(eq(reservations.roomId, roomId));
  }

  async hasOverlap({
    roomId,
    startTime,
    endTime,
  }: {
    roomId: number;
    startTime: Date;
    endTime: Date;
  }): Promise<boolean> {
    const overlapping = await this.db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.roomId, roomId),
          lte(reservations.startTime, endTime),
          gte(reservations.endTime, startTime),
        ),
      );

    return overlapping.length > 0;
  }
}
