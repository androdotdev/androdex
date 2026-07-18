import { createOpencodeClient } from "@opencode-ai/sdk";
import { test, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const URL_FILE = join(tmpdir(), "androdex-test-server-url.txt");
const BASE_URL = readFileSync(URL_FILE, "utf-8").trim();

const client = createOpencodeClient({ baseUrl: BASE_URL });

test("lists sessions", async () => {
  const allSessions = await client.session.list();
  expect(allSessions).toBeDefined();
  console.log(
    allSessions.data?.map((session: any) => ({
      id: session.id,
      title: session.title,
      summary: session.summary,
      directory: session.directory,
    })),
  );
});
