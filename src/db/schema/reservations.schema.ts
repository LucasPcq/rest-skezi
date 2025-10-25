import { index, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { rooms } from "./rooms.schema";

export const reservations = pgTable(
  "reservations",
  {
    id: serial("reservation_id").primaryKey(),
    roomId: integer("room_id")
      .notNull()
      .references(() => rooms.id),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_room_time").on(table.roomId, table.startTime, table.endTime)],
);

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
