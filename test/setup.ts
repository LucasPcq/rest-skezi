import { vi } from "vitest";

process.env.TZ = "Europe/Paris";

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});
