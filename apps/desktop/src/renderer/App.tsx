import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { MessageList } from "./components/MessageList";
import { PromptInput } from "./components/PromptInput";
import { DiffPanel } from "./components/DiffPanel";
import { Terminal } from "./components/Terminal";
import { useUiStore } from "./lib/store";

export default function App() {
  const { terminalOpen, toggleTerminal } = useUiStore();

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
