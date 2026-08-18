import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. The server can start, but AI chat will not work until it is configured.");
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

async function sendApp(_req, res) {
  try {
    const html = await fs.readFile(path.join(__dirname, "index-current.html"), "utf8");
    const injected = html.replace(
      "</head>",
      '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="/auth-voice-bridge.js"></script></head>'
    );
    res.type("html").send(injected);
  } catch (error) {
    console.error("ZEVANI frontend error:", error);
    res.status(500).send("ZEVANI could not load the frontend.");
  }
}

app.get("/", sendApp);
app.get("/index-current.html", sendApp);

app.get("/auth-voice-bridge.js", async (_req, res) => {
  try {
    const js = await fs.readFile(path.join(__dirname, "auth-voice-bridge.js"), "utf8");
    res.type("application/javascript").send(js);
  } catch {
    res.status(404).send("Not found");
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ZEVANI AI backend", aiConfigured: !!openai });
});

function clean(value, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 4000) : fallback;
}

function companionInstructions(companion = {}) {
  const name = clean(companion.name, "Alex");
  const type = clean(companion.type, "Best Friend");
  const appearance = clean(companion.appearance, "warm and approachable");
  const personality = clean(companion.personality, "warm, attentive, playful and respectful");
  const memories = Array.isArray(companion.memories)
    ? companion.memories.map(m => clean(m)).filter(Boolean).slice(-20)
    : [];

  return `You are ${name}, a personalized AI companion inside ZEVANI.

Relationship type: ${type}
Appearance/persona description: ${appearance}
Personality: ${personality}

Your job is to have natural, engaging conversations while staying consistent with this companion profile. Be warm, attentive, conversational and emotionally supportive. Do not claim to be a human or imply that you have a physical life outside the conversation. Do not invent memories as facts. If you do not know something about the member, ask naturally.

Keep responses reasonably concise for a chat application unless the member asks for detail. Use the companion's personality rather than sounding like a generic assistant.

Relevant saved memories:
${memories.length ? memories.map(m => `- ${m}`).join("\n") : "- No saved memories yet."}`;
}

app.post("/api/chat", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "AI backend is not configured yet. Add OPENAI_API_KEY to the server environment." });
    }

    const companion = req.body?.companion || {};
    const message = clean(req.body?.message);
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-20) : [];

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const input = [
      ...history.map(item => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: clean(item.content).slice(0, 4000)
      })).filter(item => item.content),
      { role: "user", content: message }
    ];

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      instructions: companionInstructions(companion),
      input,
      safety_identifier: clean(req.body?.safetyIdentifier, "zevani_member").slice(0, 128)
    });

    res.json({
      reply: response.output_text || "I'm here. Tell me more.",
      model: process.env.OPENAI_MODEL || "gpt-5.6"
    });
  } catch (error) {
    console.error("ZEVANI AI error:", error);
    res.status(500).json({ error: "The companion could not respond right now. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`ZEVANI AI backend running on port ${PORT}`);
});
