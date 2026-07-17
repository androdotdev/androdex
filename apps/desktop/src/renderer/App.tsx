import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { MessageList } from "./components/MessageList";
import { PromptInput } from "./components/PromptInput";
import { DiffPanel } from "./components/DiffPanel";
import { Terminal } from "./components/Terminal";
import { useUiStore, useSessionStore } from "./lib/store";

export default function App() {
  const terminalOpen = useUiStore((s) => s.terminalOpen);
  const toggleTerminal = useUiStore((s) => s.toggleTerminal);
  const setSessions = useSessionStore((s) => s.setSessions);
  const setActiveSession = useSessionStore((s) => s.setActiveSession);
  const model = useUiStore((s) => s.model);
  const agentMode = useUiStore((s) => s.agentMode);
  const [initDone, setInitDone] = useState(false);

  // On mount: create a default session so the send button is enabled
  useEffect(() => {
    (async () => {
      try {
        // Fetch existing sessions
        const listRes = await window.api.listSessions({ limit: 10 });
        const existing = listRes.data || [];
        if (existing.length > 0) {
          setSessions(existing);
          setActiveSession(existing[0].id);
          setInitDone(true);
          return;
        }
        // No sessions yet — create one
        const res = await window.api.createSession({
          title: "default",
          agent: agentMode,
          model: model || undefined,
          directory: ".",
        });
        if (res.data) {
          setSessions([res.data]);
          setActiveSession(res.data.id);
        }
      } catch (e) {
        console.error("Failed to init session:", e);
      } finally {
        setInitDone(true);
      }
    })();
  }, []);

  if (!initDone) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Starting Androdex…
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <MessageList />
            <PromptInput />
            <button
              onClick={toggleTerminal}
              className="text-xs px-3 py-1 bg-slate-900 border-t border-slate-800 text-slate-400 hover:text-cyan-400"
            >
              {terminalOpen ? "Hide Terminal" : "Show Terminal"}
            </button>
            <Terminal />
          </div>
          <DiffPanel />
        </div>
      </main>
    </div>
  );
}
