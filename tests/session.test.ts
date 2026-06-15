import { createOpencode, createOpencodeClient } from "@opencode-ai/sdk";
import { test, expect, afterAll } from "vitest";

const opencode = await createOpencode({
    hostname: "127.0.0.1",
    port: 4096,
});

const client = createOpencodeClient({
    baseUrl: "http://127.0.0.1:4096",
});

afterAll(() => {
    opencode?.server.close();
});

test("lists sessions", async () => {
    const allSessions = await client.session.list();
    expect(allSessions).toBeDefined();
    console.log(
        allSessions.data?.map((session) => ({
            id: session.id,
            title: session.title,
            summary: session.summary,
            directory: session.directory,
        })),
    );
});
