import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";

import { drizzle } from "drizzle-orm/node-postgres";
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
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reservations (
      reservation_id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_room_time ON reservations(room_id, start_time, end_time);
  `);
};
