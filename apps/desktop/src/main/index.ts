import { app, BrowserWindow } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerHandlers } from "../ipc/index.js";
import { createClient } from "@androdex/server";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const isDev = !app.isPackaged;
const PORT = 4096;
const HOST = "127.0.0.1";

let childProcess: ChildProcess | null = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

async function waitForHealth(): Promise<void> {
  const health = createClient(PORT, HOST);
  const timeoutMs = 10_000;
  const intervalMs = 500;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      await health.health();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  throw new Error(`OpenCode server did not start within ${timeoutMs}ms`);
}

app.whenReady().then(async () => {
  childProcess = spawn("opencode", ["serve", "--port", String(PORT)], {
    stdio: "ignore",
  });

  try {
    await waitForHealth();
  } catch (err) {
    console.error("Failed to start OpenCode server:", err);
    childProcess.kill();
    app.quit();
    return;
  }

  registerHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  if (childProcess) {
    childProcess.kill();
    childProcess = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
