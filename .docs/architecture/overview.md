# Architecture Overview

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

## Layers

| Layer | Tech | Role |
|---|---|---|
| Renderer | React + Tailwind + xterm.js | Chat UI, terminal emulator |
| Preload | CommonJS (`.cts` → `.cjs`) | `contextBridge`, 28 SDK + 5 terminal methods |
| Main | Node.js ESM (tsc) | Window lifecycle, IPC handlers, child process mgmt |
| SDK wrapper | `@androdex/server` | `createClient()` factory, `wrap(domain, fn)` errors |
| OpenCode | `opencode serve :4096` | Agent execution, session management |

## IPC Flow

- **SDK calls**: Renderer → `window.api.*` → Preload → `ipcRenderer.invoke` → `ipcMain.handle` → SDK → OpenCode
- **Terminal**: Renderer → `window.api.terminalWrite` → Preload → `pty:write` → Main → PTY host stdin → node-pty → shell
- **Terminal output**: Shell → node-pty → PTY host stdout → Main → `webContents.send('pty:data')` → Preload → `onTerminalData` → xterm.js

## Terminal Architecture

Separate PTY host process (VS Code pattern):
- **Crash isolation**: PTY crash doesn't affect Electron
- **No `electron-rebuild`**: node-pty compiles against system Node.js ABI
- **Non-blocking**: Heavy shell output doesn't block Electron's event loop
- **Protocol**: JSON lines over stdin/stdout (`write`, `resize`, `data`, `exit` types)

## Sandbox Model

Host-mode (no container):
- **Same filesystem** — agent writes instantly visible locally
- **Separate shell sessions** — PTY (you) and OpenCode (agent) never mix
- **Port lockouts** — first to bind wins (rare for agent-triggered servers)
- **Tradeoff** — user trusts agent logic; no container isolation

## IPC Channels

28 SDK channels (request/response):

| Channel | SDK Method |
|---|---|
| `opencode:getHealth` | `client.health()` |
| `opencode:listSessions` | `client.sessions.list` |
| `opencode:createSession` | `client.sessions.create` |
| `opencode:getSession` | `client.sessions.get` |
| `opencode:deleteSession` | `client.sessions.delete` |
| `opencode:getSessionMessages` | `client.sessions.messages` |
| `opencode:promptSession` | `client.sessions.prompt` |
| `opencode:abortSession` | `client.sessions.abort` |
| `opencode:forkSession` | `client.sessions.fork` |
| `opencode:getSessionDiff` | `client.sessions.diff` |
| `opencode:getVcsInfo` | `client.vcs.get` |
| `opencode:getVcsStatus` | `client.vcs.status` |
| `opencode:getVcsDiff` | `client.vcs.diff` |
| `opencode:applyVcsPatch` | `client.vcs.apply` |
| `opencode:listFiles` | `client.files.list` |
| `opencode:readFile` | `client.files.read` |
| `opencode:getFileStatus` | `client.files.status` |
| `opencode:searchText` | `client.search.text` |
| `opencode:searchFiles` | `client.search.files` |
| `opencode:searchSymbols` | `client.search.symbols` |
| `opencode:listProjects` | `client.projects.list` |
| `opencode:getCurrentProject` | `client.projects.current` |
| `opencode:getConfig` | `client.config.get` |
| `opencode:updateConfig` | `client.config.update` |
| `opencode:getProviders` | `client.config.providers` |
| `opencode:listModels` | `client.models.list` |
| `opencode:listAgents` | `client.models.agents` |
| `opencode:listCommands` | `client.commands.list` |

5 Terminal channels:

| Channel | Direction |
|---|---|
| `pty:write` | Renderer → Main |
| `pty:resize` | Renderer → Main |
| `pty:destroy` | Renderer → Main |
| `pty:data` | Main → Renderer (push) |
| `pty:exit` | Main → Renderer (push) |

## UI Component Tree

```
<App> — flex row: Sidebar | Main column
  <Sidebar> — New Thread, date-grouped thread list
  <TopBar> — session name, model dropdown, agent badge, icons
  <StatusBar> — Plan/Build/Auto tabs, tokens, cost, branch
  <ChatArea> — message list or "Let's build" empty state
    <Message> — user/assistant bubbles, tool call cards, streaming dots
    <PromptInput> — auto-grow textarea (Enter sends, Shift+Enter newline)
  <DiffPanel> — slide-over (translate-x), Working/Branch toggle
  <TerminalPanel> — xterm.js, resizable collapsible bottom panel
```
