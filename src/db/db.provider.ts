import { ConfigService } from "@nestjs/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export const DATABASE_PROVIDER = "DBProvider";

export const DB_PROVIDER = [
  {
    provide: DATABASE_PROVIDER,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const connectionString = configService.get<string>("DATABASE_URL");

      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema });
    },
  },
];
