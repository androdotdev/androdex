# Quick Start

## Prerequisites

- Node.js 20+
- pnpm
- OpenCode CLI (`npm install -g @opencode-ai/cli`)

## Setup

```bash
# Install all dependencies
pnpm install

# Build SDK wrapper
cd packages/server && pnpm build && cd ../..
```

## Development

```bash
cd apps/desktop
pnpm dev
```

This runs via `concurrently`:
1. Vite dev server (HMR on `:5173`) for the renderer
2. `tsc --watch` compiling main + preload + pty-host
3. `wait-on` then `nodemon` restarting Electron on file changes

## Build

```bash
cd apps/desktop
pnpm build:main       # tsc main + preload + ipc + pty-host
pnpm build:renderer   # vite build
pnpm build            # both + electron-builder
```

## Troubleshooting

- **`Error: Electron failed to install correctly`**: `node node_modules/electron/install.js`
- **`Cannot find module '@androdex/server'`**: Build SDK wrapper — `tsc -p packages/server/tsconfig.json`
- **Port conflict on 4096**: Change port in `src/main/index.ts` and `src/ipc/index.ts`
