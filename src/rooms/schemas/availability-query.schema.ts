import { z } from "zod";

export const availabilityQuerySchema = z.object({
  date: z.iso.date("Date must be in YYYY-MM-DD format"),
  startTime: z.iso.time({ precision: -1, error: "Start time must be in HH:mm format" }),
  endTime: z.iso.time({ precision: -1, error: "End time must be in HH:mm format" }),
  roomIds: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return val.split(",").map((id) => Number.parseInt(id.trim(), 10));
    })
    .pipe(z.array(z.number().int().positive()).optional()),
});

export type AvailabilityQueryDTO = z.infer<typeof availabilityQuerySchema>;
