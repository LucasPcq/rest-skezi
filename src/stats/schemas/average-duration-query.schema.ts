import { z } from "zod";

export const averageDurationQuerySchema = z.object({
  roomId: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive().optional()),
  startDate: z.iso.date("Start date must be in YYYY-MM-DD format").optional(),
  endDate: z.iso.date("End date must be in YYYY-MM-DD format").optional(),
});

export type AverageDurationQueryDTO = z.infer<typeof averageDurationQuerySchema>;
