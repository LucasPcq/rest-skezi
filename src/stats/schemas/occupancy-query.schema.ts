import { z } from "zod";

export const occupancyQuerySchema = z.object({
  roomId: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().int().positive()),
  period: z.enum(["daily", "weekly", "monthly"]),
  date: z.iso.date("Date must be in YYYY-MM-DD format"),
});

export type OccupancyQueryDTO = z.infer<typeof occupancyQuerySchema>;
