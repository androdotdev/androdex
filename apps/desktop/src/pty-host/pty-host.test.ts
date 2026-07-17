import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock node-pty BEFORE importing the module under test.
const fakePty = {
  write: vi.fn(),
  resize: vi.fn(),
  kill: vi.fn(),
  onData: vi.fn((cb) => cb("hello ")),
  onExit: vi.fn((cb) => cb({ exitCode: 0 })),
};

vi.mock("node-pty", () => ({
  default: { spawn: vi.fn(() => fakePty) },
  spawn: vi.fn(() => fakePty),
}));

// Mock electron's ipcMain so registerPtyHandlers wires into our fake.
const handlers: Record<string, Function> = {};
const onHandlers: Record<string, Function> = {};
vi.mock("electron", () => ({
  ipcMain: {
    handle: (ch: string, fn: Function) => (handlers[ch] = fn),
    on: (ch: string, fn: Function) => (onHandlers[ch] = fn),
  },
}));

import { registerPtyHandlers } from "./index.js";

describe("pty-host", () => {
  beforeEach(() => {
    for (const k of Object.keys(handlers)) delete handlers[k];
    for (const k of Object.keys(onHandlers)) delete (onHandlers as any)[k];
    fakePty.write.mockClear();
    fakePty.resize.mockClear();
    fakePty.kill.mockClear();
    fakePty.onData.mockClear();
    fakePty.onExit.mockClear();
  });

  it("registers pty:spawn / pty:write / pty:resize / pty:destroy", () => {
    registerPtyHandlers();
    expect(typeof handlers["pty:spawn"]).toBe("function");
    expect(typeof onHandlers["pty:write"]).toBe("function");
    expect(typeof onHandlers["pty:resize"]).toBe("function");
    expect(typeof handlers["pty:destroy"]).toBe("function");
  });

  it("pty:spawn returns ok:true for a new session id", async () => {
    registerPtyHandlers();
    const res = (await handlers["pty:spawn"]({}, "main", 80, 24)) as any;
    expect(res.ok).toBe(true);
    expect(fakePty.onData).toHaveBeenCalled();
  });

  it("pty:spawn returns ok:false for a duplicate id", async () => {
    registerPtyHandlers();
    await handlers["pty:spawn"]({}, "main", 80, 24);
    const res = (await handlers["pty:spawn"]({}, "main", 80, 24)) as any;
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("exists");
  });

  it("pty:spawn returns ok:false for invalid id", async () => {
    registerPtyHandlers();
    const res = (await handlers["pty:spawn"]({}, "", 80, 24)) as any;
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("invalid-id");
  });

  it("pty:write forwards bytes to the live session", async () => {
    registerPtyHandlers();
    await handlers["pty:spawn"]({}, "main", 80, 24);
    onHandlers["pty:write"]({}, "main", "ls\n");
    expect(fakePty.write).toHaveBeenCalledWith("ls\n");
  });

  it("pty:destroy kills and removes the session", async () => {
    registerPtyHandlers();
    await handlers["pty:spawn"]({}, "main", 80, 24);
    await handlers["pty:destroy"]({}, "main");
    expect(fakePty.kill).toHaveBeenCalled();
  });
});
