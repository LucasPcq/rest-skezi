import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";

import path from "node:path";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { schema } from "../../src/db/schema";

let container: StartedPostgreSqlContainer | null = null;
let migrationPool: Pool | null = null;

export const startTestDatabase = async () => {
  if (container) {
    return {
      connectionString: container.getConnectionUri(),
      container,
    };
  }

  container = await new PostgreSqlContainer("postgres:16")
    .withDatabase("rest_skezi_test")
    .withUsername("test_user")
    .withPassword("test_password")
    .start();

  const connectionString = container.getConnectionUri();

  migrationPool = new Pool({ connectionString });
  const db = drizzle(migrationPool, { schema });

  await migrateTestDatabase(db);

  await migrationPool.end();
  migrationPool = null;

  return {
    connectionString,
    container,
  };
};

export const stopTestDatabase = async () => {
  if (migrationPool) {
    await migrationPool.end();
    migrationPool = null;
  }

  if (container) {
    await container.stop();
    container = null;
  }
};

export const getTestDatabaseConnectionString = (): string | null => {
  return container?.getConnectionUri() ?? null;
};

const migrateTestDatabase = async (db: ReturnType<typeof drizzle>) => {
  const migrationsFolder = path.resolve(__dirname, "../../drizzle");
  await migrate(db, { migrationsFolder });
};
