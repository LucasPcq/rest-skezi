import { z } from "zod";

export const createReservationSchema = z.object({
  roomId: z.number().int().positive("Room ID must be a positive integer"),
  startTime: z.iso.datetime({
    offset: true,
    error: "Start time must be a valid ISO 8601 datetime",
  }),
  endTime: z.iso.datetime({ offset: true, error: "End time must be a valid ISO 8601 datetime" }),
});

export type CreateReservationDTO = z.infer<typeof createReservationSchema>;
