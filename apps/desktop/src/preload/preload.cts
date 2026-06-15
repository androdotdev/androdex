const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    getHealth: () => ipcRenderer.invoke("opencode:getHealth"),
    listSessions: (p?) => ipcRenderer.invoke("opencode:listSessions", p),
    createSession: (p) => ipcRenderer.invoke("opencode:createSession", p),
    getSession: (id) => ipcRenderer.invoke("opencode:getSession", id),
    deleteSession: (id) => ipcRenderer.invoke("opencode:deleteSession", id),
    getSessionMessages: (id, p?) =>
        ipcRenderer.invoke("opencode:getSessionMessages", id, p),
    promptSession: (id, p) =>
        ipcRenderer.invoke("opencode:promptSession", id, p),
    abortSession: (id) => ipcRenderer.invoke("opencode:abortSession", id),
    forkSession: (id, m?) => ipcRenderer.invoke("opencode:forkSession", id, m),
    getSessionDiff: (id, m?) =>
        ipcRenderer.invoke("opencode:getSessionDiff", id, m),
    getVcsInfo: () => ipcRenderer.invoke("opencode:getVcsInfo"),
    getVcsStatus: () => ipcRenderer.invoke("opencode:getVcsStatus"),
    getVcsDiff: (m?, c?) => ipcRenderer.invoke("opencode:getVcsDiff", m, c),
    applyVcsPatch: (p?) => ipcRenderer.invoke("opencode:applyVcsPatch", p),
    listFiles: (path) => ipcRenderer.invoke("opencode:listFiles", path),
    readFile: (path) => ipcRenderer.invoke("opencode:readFile", path),
    getFileStatus: () => ipcRenderer.invoke("opencode:getFileStatus"),
    searchText: (pat, dir?) =>
        ipcRenderer.invoke("opencode:searchText", pat, dir),
    searchFiles: (q) => ipcRenderer.invoke("opencode:searchFiles", q),
    searchSymbols: (q) => ipcRenderer.invoke("opencode:searchSymbols", q),
    listProjects: () => ipcRenderer.invoke("opencode:listProjects"),
    getCurrentProject: () => ipcRenderer.invoke("opencode:getCurrentProject"),
    getConfig: () => ipcRenderer.invoke("opencode:getConfig"),
    updateConfig: (p) => ipcRenderer.invoke("opencode:updateConfig", p),
    getProviders: () => ipcRenderer.invoke("opencode:getProviders"),
    listModels: () => ipcRenderer.invoke("opencode:listModels"),
    listAgents: () => ipcRenderer.invoke("opencode:listAgents"),
    listCommands: () => ipcRenderer.invoke("opencode:listCommands"),
    subscribeToEvents: (p?) =>
        ipcRenderer.invoke("opencode:subscribeToEvents", p),
});
