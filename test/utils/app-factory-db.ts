import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { AppModule } from "../../src/app.module";
import { DATABASE_PROVIDER } from "../../src/db/db.provider";
import { EnvelopeInterceptor } from "../../src/shared/interceptors/envelope.interceptor";
import { EnvelopeExceptionFilter } from "../../src/shared/filters/envelope-exception.filter";
import { schema, type DatabaseSchema } from "../../src/db/schema";

import { getTestDatabaseConnectionString } from "./test-db";
import { createDbResetHelper } from "./db-reset";

let sharedPool: Pool | null = null;
let sharedDb: ReturnType<typeof drizzle<DatabaseSchema>> | null = null;

export const createAppWithDb = async (): Promise<{
  app: INestApplication;
  resetDb: () => Promise<void>;
}> => {
  const connectionString = getTestDatabaseConnectionString();

  if (!connectionString) {
    throw new Error("Test database not initialized. Call startTestDatabase() first.");
  }

  if (!sharedPool) {
    sharedPool = new Pool({ connectionString, max: 10 });
    sharedDb = drizzle(sharedPool, { schema });
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DATABASE_PROVIDER)
    .useValue(sharedDb)
    .compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalInterceptors(new EnvelopeInterceptor());
  app.useGlobalFilters(new EnvelopeExceptionFilter());

  await app.init();

  if (!sharedDb) {
    throw new Error("Database instance not initialized");
  }

  const dbResetHelper = createDbResetHelper(sharedDb);

  return {
    app,
    resetDb: async () => {
      await dbResetHelper.truncateAllTables();
    },
  };
};

export const closeSharedPool = async () => {
  if (!sharedPool) return;
  await sharedPool.end();
  sharedPool = null;
  sharedDb = null;
};
