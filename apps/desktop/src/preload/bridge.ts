import { ipcRenderer } from "electron";

// Bridge between the renderer's expected `terminal*` API names (Terminal.tsx +
// env.d.ts) and the backend's `pty:*` IPC channels (pty-host/index.ts).
// Extracted into its own ESM module so it can be unit-tested without loading
// the CommonJS preload entrypoint.
export function buildPtyApi() {
  return {
    terminalSpawn: (id: string, cols: number, rows: number) =>
      ipcRenderer.invoke("pty:spawn", id, cols, rows),
    terminalWrite: (id: string, data: string) =>
      ipcRenderer.invoke("pty:write", id, data),
    terminalResize: (id: string, cols: number, rows: number) =>
      ipcRenderer.invoke("pty:resize", id, cols, rows),
    terminalDestroy: (id: string) => ipcRenderer.invoke("pty:destroy", id),
    onTerminalData: (id: string, cb: (data: string) => void) => {
      const ch = `pty:data:${id}`;
      const listener = (_e: unknown, data: string) => cb(data);
      ipcRenderer.on(ch, listener);
      return () => ipcRenderer.removeListener(ch, listener);
    },
    onTerminalExit: (id: string, cb: (code: number) => void) => {
      const ch = `pty:exit:${id}`;
      const listener = (_e: unknown, code: number) => cb(code);
      ipcRenderer.on(ch, listener);
      return () => ipcRenderer.removeListener(ch, listener);
    },
  };
}
