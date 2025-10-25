import z from "zod";

export const topRoomSchema = z.object({
  roomId: z.number().int().positive(),
  name: z.string().min(1),
  reservationCount: z.number().int().nonnegative(),
});

export type TopRoomDTO = z.infer<typeof topRoomSchema>;
