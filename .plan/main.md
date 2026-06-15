# Androdex — Implementation Plan

## Goal

Electron desktop GUI for OpenCode. Spawns OpenCode as child process, communicates via SDK, renders chat UI with terminal and git diff viewer.

## Architecture

```mermaid
flowchart LR
    subgraph Renderer["Renderer (Chromium)"]
        React[React + Tailwind]
        Xterm[xterm.js Terminal]
    end
    subgraph Preload["Preload (CJS)"]
        Bridge[contextBridge<br/>ipcRenderer.invoke]
    end
    subgraph Main["Main Process (ESM)"]
        IPC[ipc/index.ts<br/>28 ipcMain.handle]
        Lifecycle[main/index.ts<br/>spawn + waitForHealth]
        PTYHost[PTY Host Process<br/>node-pty]
    end
    subgraph ServerLib["@androdex/server"]
        Client[createClient()<br/>wrap(domain, fn)]
        SDK[@opencode-ai/sdk/v2/client]
    end
    subgraph OpenCodeProc["OpenCode Server"]
        OC[opencode serve --port 4096]
    end
    React -->|window.api.*| Bridge
    Bridge -->|ipcRenderer.invoke| IPC
    IPC --> Client
    IPC -->|pty:write/resize| PTYHost
    PTYHost -->|JSON lines| UserTerminal
    Client -->|HTTP :4096| SDK
    SDK -->|REST API| OC
    Lifecycle -->|spawn| OC
    Lifecycle -->|spawn| PTYHost
```

## Status

**Done (compile-clean):**
- packages/server: createClient() with 28 methods + wrap()
- apps/desktop/src/ipc/index.ts: 28 one-liner handlers
- apps/desktop/src/main/index.ts: spawn + waitForHealth + registerHandlers + createWindow
- apps/desktop/src/preload/preload.cts: 28 ipcRenderer.invoke methods
- All 3 layers compile via tsc -p tsconfig.main.json
- main.css, AGENTS.md, .demos/codex_ui_clone.html
- pnpm install complete

**Next (11 steps):**
1. Install node-pty, @xterm/xterm, @xterm/addon-fit
2. Create src/pty-host/index.ts — standalone node-pty, JSON lines
3. tsconfig.main.json — add pty-host to include
4. src/renderer/env.d.ts — Window.api declarations (28 SDK + 5 terminal)
5. Remove App.css
6. src/renderer/store.ts — Zustand store
7. Build 9 React components: App, Sidebar, TopBar, StatusBar, ChatArea, Message, PromptInput, DiffPanel, TerminalPanel
8. src/main/index.ts — spawn PTY host, respawn on crash
9. src/preload/preload.cts — add 5 terminal methods
10. src/ipc/index.ts — add pty:write/resize/destroy handlers
11. Verify full chain

## Key Decisions

| Decision | Choice |
|---|---|
| SDK client | Factory `createClient(port, host)` |
| Errors | `wrap(domain, fn)` in server, zero in IPC |
| Preload | `.cts` → `.cjs` (Electron sandbox) |
| Terminal | Separate PTY host process (VS Code pattern) |
| PTY protocol | JSON lines over stdin/stdout |
| Sandbox | Host-mode, same filesystem, separate shells |
| State | Zustand |
| Streaming | Future via SSE → webContents.send() |

## Directory

```
androdex/
├── .plan/main.md
├── packages/server/   ← SDK wrapper (createClient, 28 methods)
├── apps/desktop/      ← Electron app
│   └── src/
│       ├── ipc/       ← 28 IPC handlers
│       ├── main/      ← lifecycle (spawn, waitForHealth, window)
│       ├── preload/   ← contextBridge (CJS)
│       ├── pty-host/  ← standalone node-pty
│       └── renderer/  ← React + Tailwind + xterm.js
├── docs/              ← user-facing docs
├── AGENTS.md
└── .demos/codex_ui_clone.html
```
