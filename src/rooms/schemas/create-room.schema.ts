import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
});

export type CreateRoomDTO = z.infer<typeof createRoomSchema>;
