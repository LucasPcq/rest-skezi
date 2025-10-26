import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import swc from "unplugin-swc";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
    root: "./",
    include: ["test/**/*.e2e-spec.ts"],
    setupFiles: ["test/setup-e2e.ts"],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
