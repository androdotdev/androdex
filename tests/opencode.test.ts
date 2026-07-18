import { describe, it, expect } from "vitest";
import { createOpencodeClient } from "@opencode-ai/sdk/v2";
import { readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const URL_FILE = join(tmpdir(), "androdex-test-server-url.txt");
const BASE_URL = readFileSync(URL_FILE, "utf-8").trim();

const client = createOpencodeClient({ baseUrl: BASE_URL });

// HTTP health check
describe("HTTP health check", () => {
  it("returns healthy from /global/health", async () => {
    const res = await fetch(`${BASE_URL}/global/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.healthy).toBe(true);
  });
});

// SDK health check
describe("SDK health check", () => {
  it("returns healthy via client.global.health()", async () => {
    const result = await client.global.health();
    expect(result.data?.healthy).toBe(true);
  });
});
