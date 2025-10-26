import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { type DatabaseSchema } from "../../src/db/schema";

export const createDbResetHelper = (db: NodePgDatabase<DatabaseSchema>) => {
  const truncateAllTables = async () => {
    await db.execute(sql`TRUNCATE TABLE reservations RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE rooms RESTART IDENTITY CASCADE`);
  };
  return {
    truncateAllTables,
  };
};
