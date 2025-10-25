import { rooms } from "./rooms.schema";
import { reservations } from "./reservations.schema";

export const schema = {
  rooms,
  reservations,
};

export type DatabaseSchema = typeof schema;
