import { z } from "zod";

export const reservationSchema = z.object({
  id: z.number().int().positive(),
  roomId: z.number().int().positive(),
  startTime: z.date(),
  endTime: z.date(),
  createdAt: z.date(),
});

export type ReservationDTO = z.infer<typeof reservationSchema>;
