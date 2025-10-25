import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

// Rooms table
export const rooms = pgTable("rooms", {
  roomId: serial("room_id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Reservations table
export const reservations = pgTable("reservations", {
  reservationId: serial("reservation_id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.roomId),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  rooms,
  reservations,
};
