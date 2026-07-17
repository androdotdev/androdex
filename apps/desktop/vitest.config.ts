import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // node-pty is native; tests mock it. main/pty-host import 'electron'
    // which vitest stubs via vi.mock in each test file.
  },
});
