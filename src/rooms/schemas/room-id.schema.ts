import { z } from "zod";

export const roomIdSchema = z.object({
  id: z.string().transform((val) => Number.parseInt(val, 10)).pipe(z.number().int().positive()),
});

export type RoomIdParamDTO = z.infer<typeof roomIdSchema>;
