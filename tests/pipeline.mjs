import { createOpencodeClient } from "@opencode-ai/sdk/v2/client";

const BASE = "http://127.0.0.1:4098";
const client = createOpencodeClient({ baseUrl: BASE });

async function run() {
  console.log("=== BASH TOOL TEST (all permissions allowed) ===\n");

  const health = await client.global.health();
  console.log(`[1] Health: ${health.data?.healthy}`);

  const created = await client.session.create({
    model: { id: "hy3-free", providerID: "opencode" },
    directory: "/opt/data/androdex",
  });
  const sid = created.data?.id;
  console.log(`[2] Session: ${sid}`);

  // Use 'ls' in the current project directory - doesn't need external dir permission
  const promptResult = await client.session.prompt({
    sessionID: sid,
    parts: [{ type: "text", text: "Run 'echo BASH_TOOL_WORKS_ANDRODEX && ls -la package.json' in bash, then report the output" }],
  });
  console.log(`[3] Prompt sent: ${"data" in promptResult ? "✅" : "❌"}`);

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const msgs = await client.session.messages({ sessionID: sid });
    const arr = msgs.data;
    if (Array.isArray(arr) && arr.length > 0) {
      const last = arr[arr.length - 1];
      
      const toolResults = (last.parts || []).filter(p => p.type === "tool-result");
      const toolUses = (last.parts || []).filter(p => p.type === "tool-use");
      const textParts = (last.parts || []).filter(p => p.type === "text" || p.type === "reasoning");

      console.log(`[4] Poll ${i + 1}: role=${last.info?.role}, finish=${last.info?.finish}, toolResults=${toolResults.length}, textParts=${textParts.length}`);

      if (toolResults.length > 0) {
        console.log("\n=== TOOL RESULTS ===");
        for (const tp of toolResults) {
          const r = tp.result;
          console.log(`  Tool: ${tp.toolUseID}`);
          console.log(`  Exit: ${r?.exit}`);
          console.log(`  Stdout: ${(r?.stdout || "").trim()}`);
          console.log(`  Stderr: ${(r?.stderr || "").trim()}`);
        }
      }

      if (toolUses.length > 0) {
        for (const tp of toolUses) {
          console.log(`  Tool use: ${tp.tool?.name}, input: ${JSON.stringify(tp.input || tp.tool?.input)}`);
        }
      }

      for (const tp of textParts) {
        console.log(`  Text: ${(tp.text || "").trim()}`);
      }

      if (last.info?.role === "assistant" && last.info?.finish === "stop") {
        console.log("\n✅ Done");
        break;
      }
    }
  }
}

run().catch(e => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
