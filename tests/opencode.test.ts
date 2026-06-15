import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createOpencode, createOpencodeClient } from "@opencode-ai/sdk/v2";

let opencode: Awaited<ReturnType<typeof createOpencode>>;
let client: ReturnType<typeof createOpencodeClient>;

beforeAll(async () => {
    opencode = await createOpencode({ hostname: "127.0.0.1", port: 4096 });
    client = createOpencodeClient({ baseUrl: "http://127.0.0.1:4096" });
}, 15000);

afterAll(() => {
    opencode?.server.close();
});

// HTTP health check
describe("HTTP health check", () => {
    it("returns healthy from /global/health", async () => {
        const res = await fetch("http://127.0.0.1:4096/global/health");
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
