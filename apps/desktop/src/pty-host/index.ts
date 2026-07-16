import { ipcMain } from "electron";
import { spawn, type IPty } from "node-pty";
import { EventEmitter } from "node:events";

const SHELL = process.env.SHELL || (process.platform === "win32" ? "powershell.exe" : "bash");
const sessions = new Map<string, IPty>();
const emitter = new EventEmitter();

function handleData(id: string, data: string) {
  emitter.emit(`data:${id}`, data);
}

export function registerPtyHandlers(): void {
  ipcMain.handle("pty:spawn", (_e, id: string, cols: number, rows: number) => {
    if (sessions.has(id)) return;
    const pty = spawn(SHELL, [], {
      name: "xterm-color",
      cols: cols || 80,
      rows: rows || 30,
      cwd: process.cwd(),
    });
    pty.onData((d) => handleData(id, d));
    pty.onExit(({ exitCode }) => {
      emitter.emit(`exit:${id}`, exitCode);
      sessions.delete(id);
    });
    sessions.set(id, pty);
  });

  ipcMain.handle("pty:write", (_e, id: string, data: string) => {
    sessions.get(id)?.write(data);
  });

  ipcMain.handle("pty:resize", (_e, id: string, cols: number, rows: number) => {
    sessions.get(id)?.resize(cols, rows);
  });

  ipcMain.handle("pty:destroy", (_e, id: string) => {
    sessions.get(id)?.kill();
    sessions.delete(id);
  });
}

export function onPtyData(id: string, cb: (data: string) => void) {
  emitter.on(`data:${id}`, cb);
  return () => emitter.off(`data:${id}`, cb);
}

export function onPtyExit(id: string, cb: (code: number) => void) {
  emitter.on(`exit:${id}`, cb);
  return () => emitter.off(`exit:${id}`, cb);
}
