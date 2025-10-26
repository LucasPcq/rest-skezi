process.env.TZ = "Europe/Paris";

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});
