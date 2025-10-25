import { z } from "zod";

export const roomSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  capacity: z.number().int().positive(),
  createdAt: z.date(),
});

export type RoomDTO = z.infer<typeof roomSchema>;
