import { Inject, Injectable } from "@nestjs/common";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

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
}
