import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted lifts these above the hoisted vi.mock factory so the factory
// can close over them without "used before initialization".
const { exposed, ipcInvoke, ipcOn } = vi.hoisted(() => {
  const exposed: Record<string, Function> = {};
  const ipcInvoke = vi.fn(async () => ({ ok: true }));
  const ipcOn: Record<string, Function> = {};
  return { exposed, ipcInvoke, ipcOn };
});

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: (_name: string, api: Record<string, Function>) => {
      for (const k of Object.keys(api)) exposed[k] = api[k];
    },
  },
  ipcRenderer: {
    invoke: ipcInvoke,
    on: (ch: string, cb: Function) => (ipcOn[ch] = cb),
    removeListener: (ch: string, cb: Function) => {
      if (ipcOn[ch] === cb) delete ipcOn[ch];
    },
  },
}));

import { buildPtyApi } from "./bridge.js";

// The renderer (Terminal.tsx) + env.d.ts expect terminal* names; the backend
// (pty-host) registers pty:* channels. buildPtyApi bridges them. This test
// guards that contract so the two ends can't drift apart silently.
describe("preload PTY bridge contract", () => {
  beforeEach(() => {
    for (const k of Object.keys(exposed)) delete exposed[k];
    ipcInvoke.mockClear();
    for (const k of Object.keys(ipcOn)) delete ipcOn[k];
  });

  it("exposes terminalSpawn that invokes pty:spawn and returns ok", async () => {
    const api = buildPtyApi();
    exposed["terminalSpawn"] = api.terminalSpawn;
    const res = await exposed["terminalSpawn"]("main", 80, 24);
    expect(ipcInvoke).toHaveBeenCalledWith("pty:spawn", "main", 80, 24);
    expect(res).toEqual({ ok: true });
  });

  it("exposes terminalWrite that invokes pty:write", () => {
    const api = buildPtyApi();
    exposed["terminalWrite"] = api.terminalWrite;
    api.terminalWrite("main", "ls\n");
    expect(ipcInvoke).toHaveBeenCalledWith("pty:write", "main", "ls\n");
  });

  it("exposes terminalResize that invokes pty:resize", () => {
    const api = buildPtyApi();
    exposed["terminalResize"] = api.terminalResize;
    api.terminalResize("main", 80, 24);
    expect(ipcInvoke).toHaveBeenCalledWith("pty:resize", "main", 80, 24);
  });

  it("exposes terminalDestroy that invokes pty:destroy", () => {
    const api = buildPtyApi();
    exposed["terminalDestroy"] = api.terminalDestroy;
    api.terminalDestroy("main");
    expect(ipcInvoke).toHaveBeenCalledWith("pty:destroy", "main");
  });

  it("exposes onTerminalData that subscribes to pty:data:main", () => {
    const api = buildPtyApi();
    exposed["onTerminalData"] = api.onTerminalData;
    const cb = () => {};
    const off = api.onTerminalData("main", cb);
    expect(typeof ipcOn["pty:data:main"]).toBe("function");
    off();
    expect(ipcOn["pty:data:main"]).toBeUndefined();
  });
});
