import { createOpencodeClient } from "@opencode-ai/sdk/v2/client";

async function wrap<T>(domain: string, fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        throw new Error(
            `${domain}: ${err instanceof Error ? err.message : String(err)}`,
        );
    }
}

export interface AndrodexClient {
    health(): Promise<any>;
    sessions: {
        list: (params?: any) => Promise<any>;
        create: (params?: any) => Promise<any>;
        get: (sessionID: string) => Promise<any>;
        delete: (sessionID: string) => Promise<any>;
        messages: (sessionID: string, params?: any) => Promise<any>;
        prompt: (sessionID: string, params?: any) => Promise<any>;
        promptAsync: (sessionID: string, params?: any) => Promise<any>;
        abort: (sessionID: string) => Promise<any>;
        fork: (sessionID: string, messageID?: string) => Promise<any>;
        diff: (sessionID: string, messageID?: string) => Promise<any>;
        status: () => Promise<any>;
        summarize: (sessionID: string, params?: any) => Promise<any>;
    };
    vcs: {
        get: () => Promise<any>;
        status: () => Promise<any>;
        diff: (mode?: "git" | "branch", context?: number) => Promise<any>;
        apply: (patch?: string) => Promise<any>;
    };
    files: {
        list: (path: string) => Promise<any>;
        read: (path: string) => Promise<any>;
        status: () => Promise<any>;
    };
    search: {
        text: (pattern: string, path?: string) => Promise<any>;
        files: (query: string) => Promise<any>;
        symbols: (query: string) => Promise<any>;
    };
    projects: {
        list: () => Promise<any>;
        current: () => Promise<any>;
    };
    config: {
        get: () => Promise<any>;
        update: (params?: any) => Promise<any>;
        providers: () => Promise<any>;
    };
    models: {
        list: () => Promise<any>;
        agents: () => Promise<any>;
    };
    commands: {
        list: () => Promise<any>;
    };
    events: {
        subscribe: (params?: any) => Promise<any>;
    };
}

export function createClient(port = 4096, host = "127.0.0.1"): AndrodexClient {
    const sdk = createOpencodeClient({
        baseUrl: `http://${host}:${port}`,
        throwOnError: true,
    });

    return {
        health: () => wrap("health", () => sdk.global.health()),

        sessions: {
            list: (params?) =>
                wrap("sessions:list", () => sdk.session.list(params)),
            create: (params?) =>
                wrap("sessions:create", () => sdk.session.create(params)),
            get: (id) =>
                wrap("sessions:get", () => sdk.session.get({ sessionID: id })),
            delete: (id) =>
                wrap("sessions:delete", () =>
                    sdk.session.delete({ sessionID: id }),
                ),
            messages: (id, p?) =>
                wrap("sessions:messages", () =>
                    sdk.session.messages({ sessionID: id, ...p }),
                ),
            prompt: (id, p?) =>
                wrap("sessions:prompt", () =>
                    sdk.session.prompt({ sessionID: id, ...p }),
                ),
            promptAsync: (id, p?) =>
                wrap("sessions:promptAsync", () =>
                    sdk.session.promptAsync({ sessionID: id, ...p }),
                ),
            abort: (id) =>
                wrap("sessions:abort", () =>
                    sdk.session.abort({ sessionID: id }),
                ),
            fork: (id, m?) =>
                wrap("sessions:fork", () =>
                    sdk.session.fork({ sessionID: id, messageID: m }),
                ),
            diff: (id, m?) =>
                wrap("sessions:diff", () =>
                    sdk.session.diff({ sessionID: id, messageID: m }),
                ),
            status: () => wrap("sessions:status", () => sdk.session.status()),
            summarize: (id, p?) =>
                wrap("sessions:summarize", () =>
                    sdk.session.summarize({ sessionID: id, ...p }),
                ),
        },

        vcs: {
            get: () => wrap("vcs:get", () => sdk.vcs.get()),
            status: () => wrap("vcs:status", () => sdk.vcs.status()),
            diff: (m?, c?) =>
                wrap("vcs:diff", () =>
                    sdk.vcs.diff({ mode: m, context: c } as any),
                ),
            apply: (patch?) =>
                wrap("vcs:apply", () => sdk.vcs.apply({ patch })),
        },

        files: {
            list: (path) => wrap("files:list", () => sdk.file.list({ path })),
            read: (path) => wrap("files:read", () => sdk.file.read({ path })),
            status: () => wrap("files:status", () => sdk.file.status()),
        },

        search: {
            text: (pattern, path?) =>
                wrap("search:text", () =>
                    sdk.find.text({
                        pattern,
                        ...(path ? { directory: path } : {}),
                    }),
                ),
            files: (query) =>
                wrap("search:files", () => sdk.find.files({ query })),
            symbols: (query) =>
                wrap("search:symbols", () => sdk.find.symbols({ query })),
        },

        projects: {
            list: () => wrap("projects:list", () => sdk.project.list()),
            current: () =>
                wrap("projects:current", () => sdk.project.current()),
        },

        config: {
            get: () => wrap("config:get", () => sdk.config.get()),
            update: (params?) =>
                wrap("config:update", () => sdk.config.update(params)),
            providers: () =>
                wrap("config:providers", () => sdk.config.providers()),
        },

        models: {
            list: () => wrap("models:list", () => sdk.v2.model.list()),
            agents: () => wrap("models:agents", () => sdk.app.agents()),
        },

        commands: {
            list: () => wrap("commands:list", () => sdk.command.list()),
        },

        events: {
            subscribe: (params?) =>
                wrap("events:subscribe", () => sdk.global.event(params)),
        },
    };
}
