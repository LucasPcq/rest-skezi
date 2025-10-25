import { Inject, Injectable } from "@nestjs/common";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleQueryError, and, eq, inArray, notInArray } from "drizzle-orm";
import { DatabaseError } from "pg";

import { schema } from "../db/schema";
import { Room, rooms } from "../db/schema/rooms.schema";

import { DATABASE_PROVIDER } from "../db/db.provider";

import type { CreateRoomDTO } from "./schemas/create-room.schema";

import { PG_ERROR_STATUS } from "../shared/errors/errors";

@Injectable()
export class RoomsRepository {
  constructor(@Inject(DATABASE_PROVIDER) private db: NodePgDatabase<typeof schema>) {}

  async create(data: CreateRoomDTO): Promise<Room | null> {
    try {
      const result = await this.db.insert(rooms).values(data).returning();
      return result[0] || null;
    } catch (error) {
      if (error instanceof DrizzleQueryError) {
        if (error.cause instanceof DatabaseError) {
          if (error.cause.code === PG_ERROR_STATUS.UNIQUE_VIOLATION) {
            return null;
          }
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Room[]> {
    return this.db.select().from(rooms);
  }

  async findById(roomId: number): Promise<Room | null> {
    const result = await this.db.select().from(rooms).where(eq(rooms.id, roomId));
    return result[0] || null;
  }

  async findAvailableRooms({
    roomIds,
    unavailableRoomIds,
  }: {
    roomIds?: number[];
    unavailableRoomIds: number[];
  }): Promise<Room[]> {
    return this.db
      .select()
      .from(rooms)
      .where(
        and(
          ...(roomIds ? [inArray(rooms.id, roomIds)] : []),
          ...(unavailableRoomIds.length > 0 ? [notInArray(rooms.id, unavailableRoomIds)] : []),
        ),
      );
  }
}
