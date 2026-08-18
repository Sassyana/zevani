import OpenAI from "openai";

function clean(value, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 4000) : fallback;
}

function instructions(companion = {}) {
  const name = clean(companion.name, "Alex");
  const type = clean(companion.type, "Best Friend");
  const personality = clean(companion.personality, "warm, attentive, playful and respectful");
  return `You are ${name}, a personalized AI companion inside ZEVANI.\nRelationship type: ${type}\nPersonality: ${personality}\nRespond naturally and conversationally as this companion. Be warm, attentive and consistent with the personality. Do not claim to be human or invent memories. Keep replies reasonably concise unless the user asks for detail.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(503).json({ error: "OPENAI_API_KEY is not configured on this deployment." });
    const body = req.body || {};
    const message = clean(body.message);
    if (!message) return res.status(400).json({ error: "Message is required." });
    const history = Array.isArray(body.history) ? body.history.slice(-20) : [];
    const input = history.map(item => ({ role: item.role === "assistant" ? "assistant" : "user", content: clean(item.content) })).filter(item => item.content);
    input.push({ role: "user", content: message });
    const client = new OpenAI({ apiKey: key });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      instructions: instructions(body.companion),
      input
    });
    return res.status(200).json({ ok: true, reply: response.output_text || "I'm here with you." });
  } catch (error) {
    console.error("ZEVANI OpenAI error:", error);
    const status = Number(error?.status) || 500;
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: error?.error?.message || error?.message || "Unknown OpenAI error",
      type: error?.type || error?.error?.type || "unknown",
      code: error?.code || error?.error?.code || "unknown"
    });
  }
}
