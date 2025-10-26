import { startTestDatabase, stopTestDatabase } from "./utils/test-db";
import { closeSharedPool } from "./utils/app-factory-db";

process.env.TZ = "Europe/Paris";

beforeAll(async () => {
  await startTestDatabase();
}, 60000);

afterAll(async () => {
  await closeSharedPool();
  await stopTestDatabase();
}, 10000);

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});
