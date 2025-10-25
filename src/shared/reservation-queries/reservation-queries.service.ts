import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, gte, inArray, lte } from "drizzle-orm";

import { DATABASE_PROVIDER } from "../../db/db.provider";
import { type schema } from "../../db/schema";
import { type Reservation, reservations } from "../../db/schema/reservations.schema";

@Injectable()
export class ReservationQueriesService {
  constructor(@Inject(DATABASE_PROVIDER) private db: NodePgDatabase<typeof schema>) {}

  async findOverlappingReservations({
    startTime,
    endTime,
    roomIds,
  }: {
    startTime: Date;
    endTime: Date;
    roomIds?: number[];
  }): Promise<Reservation[]> {
    return this.db
      .select()
      .from(reservations)
      .where(
        and(
          lte(reservations.startTime, endTime),
          gte(reservations.endTime, startTime),
          roomIds ? inArray(reservations.roomId, roomIds) : undefined,
        ),
      );
  }
}
