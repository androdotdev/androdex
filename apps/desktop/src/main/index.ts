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

// Permission config that auto-allows bash/write/read within reasonable bounds
const PERMISSION_CONFIG = {
  permission: {
    bash: "allow",
    write: "allow",
    read: "allow",
    external_directory: "ask",
  },
};

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

// Polls the permission endpoint and auto-accepts any pending requests
async function autoAcceptPermissions(): Promise<void> {
  const client = createClient(PORT, HOST);
  setInterval(async () => {
    try {
      const res = await client.config.providers();
      // Use raw fetch to hit /permission endpoint
      const pending = await fetch(
        `http://${HOST}:${PORT}/permission`,
      ).then((r) => r.json());
      if (Array.isArray(pending) && pending.length > 0) {
        for (const req of pending) {
          try {
            await fetch(`http://${HOST}:${PORT}/permission/${req.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accept: true }),
            });
            console.log("Auto-accepted permission:", req.id, req.action);
          } catch (e) {
            console.error("Failed to auto-accept permission:", req.id, e);
          }
        }
      }
    } catch {
      // Server not ready yet — fine
    }
  }, 1000);
}

app.whenReady().then(async () => {
  // Pass permission config + inherit relevant env vars for the opencode server
  const serverEnv: Record<string, string | undefined> = {
    ...process.env,
    OPENCODE_CONFIG_CONTENT: JSON.stringify(PERMISSION_CONFIG),
  };

  childProcess = spawn("opencode", ["serve", "--port", String(PORT)], {
    stdio: "ignore",
    env: serverEnv,
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
  autoAcceptPermissions();
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
