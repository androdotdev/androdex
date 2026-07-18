/**
 * Global setup: starts ONE opencode server for all test files.
 * Writes the URL to a shared temp file so test files can read it.
 * Vitest's `globalSetup` runs in the main process, not in workers.
 */
import { createOpencode } from "@opencode-ai/sdk";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const URL_FILE = join(tmpdir(), "androdex-test-server-url.txt");

let server: Awaited<ReturnType<typeof createOpencode>>;

export async function setup(): Promise<void> {
  server = await createOpencode({
    hostname: "127.0.0.1",
    port: 0,
  });
  writeFileSync(URL_FILE, server.server.url);
}

export async function teardown(): Promise<void> {
  if (server) {
    server.server.close();
  }
  try {
    unlinkSync(URL_FILE);
  } catch {
    // ignore
  }
}
