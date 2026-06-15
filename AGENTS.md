# Androdex — Agent Operating Guide

## Project Overview

An Electron desktop GUI for OpenCode. Spawns OpenCode as a child process, communicates via SDK, renders a chat UI with sessions, messages, and git diff viewer.

## Directory Structure

```
androdex/
├── .plan/main.md                       ← Architecture plan
├── .demos/codex_ui_clone.html          ← UI mockup reference
├── packages/
│   └── server/                         ← SDK wrapper (shared lib)
│       ├── package.json
│       ├── tsconfig.json
│       └── index.ts                    ← Exports client + all SDK wrappers
├── apps/
│   └── desktop/                        ← Electron app
│       ├── package.json
│       ├── tsconfig.main.json          ← tsc config for main + preload
│       ├── vite.config.ts              ← Vite for renderer
│       ├── electron-builder.yml        ← Packaging config
│       ├── src/
│       │   ├── main/
│       │   │   └── index.ts            ← Electron main process (IPC handlers)
│       │   ├── preload/
│       │   │   └── preload.cts         ← contextBridge (CommonJS)
│       │   └── renderer/
│       │       ├── index.html
│       │       └── src/
│       │           ├── main.tsx         ← React entry
│       │           ├── App.tsx          ← Root component
│       │           ├── env.d.ts         ← Window.api types
│       │           ├── components/
│       │           │   ├── Sidebar.tsx
│       │           │   ├── ThreadGroup.tsx
│       │           │   ├── ChatArea.tsx
│       │           │   └── PromptInput.tsx
│       │           └── assets/
│       │               └── main.css
│       └── public/
├── pnpm-workspace.yaml
└── package.json                        ← root (orchestration only)
```

## Architecture Flow

```
Renderer (React) → window.api.* → Preload (preload.cts)
  → ipcRenderer.invoke('opencode:X')
  → Main (main/index.ts) ipcMain.handle
  → @androdex/server SDK wrapper
  → @opencode-ai/sdk/v2/client
  → OpenCode server (child process on port 4096)
```

## Build System

| Layer | Source | Compiled | Tool |
|---|---|---|---|
| Main | `src/main/index.ts` | `dist/main/index.js` | `tsc` |
| Preload | `src/preload/preload.cts` | `dist/preload/preload.cjs` | `tsc` |
| Renderer | `src/renderer/src/` | `dist/renderer/` | Vite |
| SDK wrapper | `packages/server/index.ts` | `packages/server/dist/` | `tsc` |

### Dev command (from apps/desktop/)

```bash
pnpm dev
```

Runs via `concurrently`:
1. `vite` — renderer HMR
2. `tsc --watch` — compile main + preload
3. `wait-on tcp:5173 && wait-on dist/main/index.js && nodemon --watch dist --ext js --exec electron .`

### Build command

```bash
pnpm build:main     # tsc -p tsconfig.main.json
pnpm build          # vite build + tsc + electron-builder
```

## Key Conventions

### File Extensions
- Main process: `.ts` (compiled to `.js` ESM — package.json has `"type": "module"`)
- Preload: `.cts` (compiled to `.cjs` CJS — Electron sandbox requires `require()`)
- Renderer: `.tsx` (compiled by Vite)
- SDK wrapper: `.ts` (compiled to `.js` ESM)

### TypeScript Configs
- Main/preload: `tsconfig.main.json` — `module: "NodeNext"`, `rootDir: "src"`, `outDir: "dist"`
- Packages/server: `packages/server/tsconfig.json` — `module: "NodeNext"`, `declaration: true`
- Renderer: `tsconfig.web.json` (Vite handles this)

### IPC Pattern
```
preload.cts:  contextBridge.exposeInMainWorld('api', { method: () => ipcRenderer.invoke('opencode:method') })
main/index.ts: ipcMain.handle('opencode:method', async (_, args) => { return sdkMethod(args) })
env.d.ts:      interface Window { api: { method: () => Promise<T> } }
```

All IPC handlers are registered in `apps/desktop/src/main/index.ts` inside `app.whenReady()`.

### UI Styling
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- `@import "tailwindcss"` in `main.css`
- Tabler Icons via `@tabler/icons-react`
- Dark theme, colors match `.demos/codex_ui_clone.html`

## SDK API Reference (@opencode-ai/sdk/v2/client)

### Session API
```ts
client.session.list(params?: { directory?, workspace?, limit? })
client.session.create(params: { title?, agent?, model?, directory? })
client.session.get(params: { sessionID })
client.session.delete(params: { sessionID })
client.session.messages(params: { sessionID, limit?, before? })
client.session.prompt(params: { sessionID, parts })
client.session.promptAsync(params: { sessionID, parts })
client.session.abort(params: { sessionID })
client.session.fork(params: { sessionID, messageID? })
client.session.diff(params: { sessionID, messageID? })
client.session.status()
client.session.summarize(params: { sessionID })
```

### VCS/Git API
```ts
client.vcs.get()                          // branch info
client.vcs.status()                       // file status list
client.vcs.diff(params: { mode, context? })  // mode: "git" | "branch"
client.vcs.apply(params: { patch? })
```

### File API
```ts
client.file.list(params: { pattern? })
client.file.read(params: { path })
client.file.status()
```

### Search API
```ts
client.find.text(params: { pattern, path? })
client.find.files(params: { pattern })
client.find.symbols(params: { query })
```

### Project API
```ts
client.project.list()
client.project.current()
```

### Config API
```ts
client.config.get()
client.config.update(params?)
client.config.providers()
```

### Model/Agent API (via client.v2)
```ts
client.v2.model.list()
client.v2.agent.list()
```

### Misc APIs
```ts
client.command.list()
client.app.log()
client.app.agents()
client.tool.ids()
client.tool.list(params: { body: { ids } })
client.worktree.list()
client.worktree.create(params: { path, branch? })
client.global.health()
client.event.subscribe()  // SSE events
```

## UI Component Tree

```
<App>
  <Sidebar>
    <SidebarHeader />          — "New Thread" + Agents + Skills buttons
    <ThreadGroup title="...">  — collapsible folder
      <ThreadItem />           — session title, cost badge, active state
    </ThreadGroup>
  </Sidebar>
  <Main>
    <TopBar>
      <TopBarTitle />          — current session name
      <ModelSelect />          — provider/model dropdown
      <AgentBadge />           — Plan / Build / Auto mode
      <DiffButton />           — toggle git diff panel
    </TopBar>
    <MessageList>              — scrollable message area
      <Message />              — user or assistant bubble
        <ToolCallCard />       — collapsible tool command/output
        <StreamingIndicator /> — animated dots during response
      <EmptyState />           — "Let's build" landing when no msgs
    </MessageList>
    <DiffPanel />              — slide-out git diff viewer
    <PromptInput>              — text input + send + attach buttons
    <StatusBar>                — mode tabs + token count + cost + branch
  </Main>
</App>
```

## IPC Contract (window.api)

```ts
interface Window {
  api: {
    // Health
    getHealth(): Promise<{ data: { healthy: boolean } }>

    // Sessions
    listSessions(params?: { directory?: string; workspace?: string; limit?: number }): Promise<{ data: Session[] }>
    getSession(sessionID: string): Promise<{ data: Session }>
    createSession(params: { title?: string; agent?: string; model?: string; directory?: string }): Promise<{ data: Session }>
    deleteSession(sessionID: string): Promise<void>
    getSessionMessages(sessionID: string, params?: { limit?: number; before?: string }): Promise<{ data: Message[] }>
    promptSession(sessionID: string, parts: any[]): Promise<{ data: any }>
    promptSessionAsync(sessionID: string, parts: any[]): Promise<{ data: any }>
    abortSession(sessionID: string): Promise<void>
    forkSession(sessionID: string, messageID?: string): Promise<{ data: Session }>
    getSessionDiff(sessionID: string, messageID?: string): Promise<{ data: any }>

    // Git
    getVcsInfo(): Promise<{ data: any }>
    getVcsStatus(): Promise<{ data: any }>
    getVcsDiff(mode?: 'git' | 'branch', context?: number): Promise<{ data: any }>
    applyVcsPatch(patch?: string): Promise<{ data: any }>

    // Files
    listFiles(pattern?: string): Promise<{ data: any }>
    readFile(path: string): Promise<{ data: any }>
    getFileStatus(): Promise<{ data: any }>

    // Search
    searchText(pattern: string, path?: string): Promise<{ data: any }>
    searchFiles(pattern: string): Promise<{ data: any }>
    searchSymbols(query: string): Promise<{ data: any }>

    // Projects
    listProjects(): Promise<{ data: any }>
    getCurrentProject(): Promise<{ data: any }>

    // Config
    getConfig(): Promise<{ data: any }>
    getProviders(): Promise<{ data: any }>

    // Models & Agents
    listModels(): Promise<{ data: any }>
    listAgents(): Promise<{ data: any }>

    // Commands
    listCommands(): Promise<{ data: any }>

    // Events (SSE)
    subscribeToEvents(): Promise<any>
  }
}
```

## UI Mockup Reference

See `.demos/codex_ui_clone.html` for the full design reference. Key states:

1. **Empty state** — "Let's build" logo + repo pill (shown when no session selected or no messages)
2. **Active conversation** — User/assistant bubbles, tool-call cards with collapse, streaming indicator
3. **Diff panel** — Slide-out from right with Working/Branch mode toggle, file-by-file diff lines
4. **Model selector** — Dropdown in topbar showing provider/model
5. **Agent mode** — Plan / Build / Auto tabs in status bar (mapped to OpenCode agent modes)
6. **Token/cost** — Displayed in status bar right side

## Agent Modes (OpenCode)

| Tab | OpenCode equivalent | Behavior |
|---|---|---|
| Plan | Agent mode: "plan" | Read-only analysis, explains without making changes |
| Build | Agent mode: "build" | Executes changes, runs commands, edits files |
| Auto | Agent mode: "auto" | AI decides based on context |

## Common Issues & Fixes

- **`Error: Electron failed to install correctly`** → Run `node node_modules/electron/install.js` in `apps/desktop/`
- **Preload `import` error** → Preload must be CJS (`.cts` → `.cjs`). Electron sandbox doesn't support `import`
- **Missing `dist/main/index.js`** → Run `tsc -p tsconfig.main.json` in `apps/desktop/`
- **`Cannot find module '@androdex/server'`** → Build SDK wrapper: `tsc -p packages/server/tsconfig.json`
- **Port conflict on 4096** → Change `spawn('opencode', ['serve', '--port', '4096'])` port in `main/index.ts`

## Package Manager

- pnpm workspace monorepo
- `catalog:` references shared dependency versions in `pnpm-workspace.yaml`
- `shamefully-hoist=true` in root `.npmrc` (needed for electron native modules)
- `@androdex/server` is a workspace dependency — `"@androdex/server": "workspace:*"` in desktop's package.json
