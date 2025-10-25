import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { rooms } from "./rooms.schema";

// Reservations table
export const reservations = pgTable("reservations", {
  id: serial("reservation_id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
