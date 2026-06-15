interface Session {
    id: string;
    title: string;
    agent: string;
    model: string;
    directory: string;
    state: string;
    createdAt: string;
    updatedAt: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    toolCalls: ToolCall[];
    status: "streaming" | "done" | "error";
}

interface ToolCall {
    id: string;
    tool: string;
    command: string;
    output: string;
    status: "running" | "completed" | "failed";
}

interface ApiResponse<T> {
    data: T;
    error?: string;
}

interface Window {
    api: {
        // Sessions
        getHealth(): Promise<ApiResponse<{ healthy: boolean }>>;
        listSessions(params?: {
            directory?: string;
            workspace?: string;
            limit?: number;
        }): Promise<ApiResponse<Session[]>>;
        createSession(params: {
            title?: string;
            agent?: string;
            model?: string;
            directory?: string;
        }): Promise<ApiResponse<Session>>;
        getSession(sessionID: string): Promise<ApiResponse<Session>>;
        deleteSession(sessionID: string): Promise<void>;
        getSessionMessages(
            sessionID: string,
            params?: { limit?: number; before?: string },
        ): Promise<ApiResponse<Message[]>>;
        promptSession(
            sessionID: string,
            parts: any[],
        ): Promise<ApiResponse<any>>;
        abortSession(sessionID: string): Promise<void>;
        forkSession(
            sessionID: string,
            messageID?: string,
        ): Promise<ApiResponse<Session>>;
        getSessionDiff(
            sessionID: string,
            messageID?: string,
        ): Promise<ApiResponse<any>>;
        // VCS
        getVcsInfo(): Promise<ApiResponse<any>>;
        getVcsStatus(): Promise<ApiResponse<any>>;
        getVcsDiff(
            mode?: "git" | "branch",
            context?: number,
        ): Promise<ApiResponse<any>>;
        applyVcsPatch(patch?: string): Promise<ApiResponse<any>>;
        // Files
        listFiles(pattern?: string): Promise<ApiResponse<any>>;
        readFile(path: string): Promise<ApiResponse<any>>;
        getFileStatus(): Promise<ApiResponse<any>>;
        // Search
        searchText(pattern: string, path?: string): Promise<ApiResponse<any>>;
        searchFiles(pattern: string): Promise<ApiResponse<any>>;
        searchSymbols(query: string): Promise<ApiResponse<any>>;
        // Projects
        listProjects(): Promise<ApiResponse<any>>;
        getCurrentProject(): Promise<ApiResponse<any>>;
        // Config
        getConfig(): Promise<ApiResponse<any>>;
        updateConfig(params: any): Promise<ApiResponse<any>>;
        getProviders(): Promise<ApiResponse<any>>;
        // Events
        subscribeToEvents(params?: any): Promise<ApiResponse<any>>;
        // Models
        listModels(): Promise<ApiResponse<any>>;
        listAgents(): Promise<ApiResponse<any>>;
        listCommands(): Promise<ApiResponse<any>>;
        // Terminal
        terminalWrite(data: string): Promise<void>;
        terminalResize(cols: number, rows: number): Promise<void>;
        terminalDestroy(): Promise<void>;
        onTerminalData(callback: (data: string) => void): void;
        onTerminalExit(callback: (code: number) => void): void;
    };
}
