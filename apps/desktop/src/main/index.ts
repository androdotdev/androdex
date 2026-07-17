import { app, BrowserWindow, dialog } from "electron";
import { spawn, type ChildProcess, execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { registerHandlers } from "../ipc/index.js";
import { registerPtyHandlers, onPtyData, onPtyExit } from "../pty-host/index.js";
import { createClient } from "@androdex/server";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const isDev = !app.isPackaged;
const PORT = 4096;
const HOST = "127.0.0.1";

let childProcess: ChildProcess | null = null;

// Resolve the opencode binary. Priority:
//   1. Bundled binary in app resources (extraResources -> resources/opencode/)
//   2. System PATH (for dev / user-installed opencode)
// Returns null if not found anywhere.
function findOpencode(): string | null {
  // 1. Bundled resource (packaged app)
  const bundled = path.join(process.resourcesPath, "opencode", process.platform === "win32" ? "opencode.exe" : "opencode");
  if (fs.existsSync(bundled)) return bundled;

  // 2. System PATH
  const cmd = process.platform === "win32" ? "where opencode" : "which opencode";
  try {
    const found = execSync(cmd, { encoding: "utf8" }).split(/\r?\n/)[0].trim();
    return found || null;
  } catch {
    return null;
  }
}

let mainWindowRef: import("electron").BrowserWindow | null = null;

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

  mainWindowRef = mainWindow;
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  // Forward PTY output/exit from the main process to the renderer.
  onPtyData("main", (data) => mainWindowRef?.webContents.send("pty:data:main", data));
  onPtyExit("main", (code) => mainWindowRef?.webContents.send("pty:exit:main", code));
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
  const opencodePath = findOpencode();
  if (!opencodePath) {
    await dialog.showErrorBox(
      "OpenCode not found",
      "Androdex needs the 'opencode' CLI to run.\n\nInstall it with:\n  npm install -g opencode-ai\nor:\n  curl -fsSL https://opencode.ai/install | bash\n\nthen restart Androdex.",
    );
    app.quit();
    return;
  }

  childProcess = spawn(opencodePath, ["serve", "--port", String(PORT)], {
    stdio: "ignore",
    env: process.env,
  });

  childProcess.on("error", (err) => {
    console.error("Failed to spawn OpenCode server:", err);
  });

  try {
    await waitForHealth();
  } catch (err) {
    console.error("Failed to start OpenCode server:", err);
    childProcess.kill();
    await dialog.showErrorBox(
      "OpenCode failed to start",
      "The OpenCode server did not become ready in time. Check that the 'opencode' CLI works in your terminal.",
    );
    app.quit();
    return;
  }

  registerHandlers();
  registerPtyHandlers();
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
