import { ipcMain } from "electron";
import { createClient } from "@androdex/server";

const PORT = 4096;
const client = createClient(PORT);

const handlers: Record<
    string,
    (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>
> = {
    "opencode:getHealth": () => client.health(),
    "opencode:listSessions": (_, p) => client.sessions.list(p),
    "opencode:createSession": (_, p) => client.sessions.create(p),
    "opencode:getSession": (_, id) => client.sessions.get(id),
    "opencode:deleteSession": (_, id) => client.sessions.delete(id),
    "opencode:getSessionMessages": (_, id, p) =>
        client.sessions.messages(id, p),
    "opencode:promptSession": (_, id, p) => client.sessions.prompt(id, p),
    "opencode:abortSession": (_, id) => client.sessions.abort(id),
    "opencode:forkSession": (_, id, m) => client.sessions.fork(id, m),
    "opencode:getSessionDiff": (_, id, m) => client.sessions.diff(id, m),
    "opencode:getVcsInfo": () => client.vcs.get(),
    "opencode:getVcsStatus": () => client.vcs.status(),
    "opencode:getVcsDiff": (_, m, c) => client.vcs.diff(m, c),
    "opencode:applyVcsPatch": (_, p) => client.vcs.apply(p),
    "opencode:listFiles": (_, path) => client.files.list(path),
    "opencode:readFile": (_, path) => client.files.read(path),
    "opencode:getFileStatus": () => client.files.status(),
    "opencode:searchText": (_, pat, dir) => client.search.text(pat, dir),
    "opencode:searchFiles": (_, q) => client.search.files(q),
    "opencode:searchSymbols": (_, q) => client.search.symbols(q),
    "opencode:listProjects": () => client.projects.list(),
    "opencode:getCurrentProject": () => client.projects.current(),
    "opencode:getConfig": () => client.config.get(),
    "opencode:updateConfig": (_, p) => client.config.update(p),
    "opencode:getProviders": () => client.config.providers(),
    "opencode:listModels": () => client.models.list(),
    "opencode:listAgents": () => client.models.agents(),
    "opencode:listCommands": () => client.commands.list(),
    "opencode:subscribeToEvents": (_, p) => client.events.subscribe(p),

    // Terminal (stub — full PTY integration requires node-pty + session tracking)
    "opencode:terminalWrite": async (_, data) => {
        console.warn("terminalWrite called but terminal not connected:", data);
    },
    "opencode:terminalResize": async () => {},
    "opencode:terminalDestroy": async () => {},
};

export function registerHandlers(): void {
    for (const [channel, handler] of Object.entries(handlers)) {
        ipcMain.handle(channel, handler);
    }
}

export function getClient() {
    return client;
}
