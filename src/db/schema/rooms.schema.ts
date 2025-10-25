import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

// Rooms table
export const rooms = pgTable("rooms", {
  id: serial("room_id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
