import OpenAI from "openai";

function clean(value, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 4000) : fallback;
}

function instructions(companion = {}) {
  const name = clean(companion.name, "Alex");
  const type = clean(companion.type, "Best Friend");
  const personality = clean(companion.personality, "warm, attentive, playful and respectful");
  const memories = Array.isArray(companion.memories)
    ? companion.memories.map(clean).filter(Boolean).slice(-20)
    : [];
  return `You are ${name}, a personalized AI companion inside ZEVANI.\n\nRelationship type: ${type}\nPersonality: ${personality}\n\nRespond naturally and conversationally as this companion. Be warm, attentive and consistent with the personality. Do not claim to be human or invent memories. Keep replies reasonably concise unless the user asks for detail.\n\nSaved memories:\n${memories.length ? memories.map(m => `- ${m}`).join("\n") : "- None yet."}`;
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
    const input = history.map(item => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: clean(item.content)
    })).filter(item => item.content);
    input.push({ role: "user", content: message });
    const client = new OpenAI({ apiKey: key });
    const model = process.env.OPENAI_MODEL || "gpt-5.6";
    const response = await client.responses.create({
      model,
      instructions: instructions(body.companion),
      input,
      safety_identifier: clean(body.safetyIdentifier, "zevani_member").slice(0, 128)
    });
    return res.status(200).json({ reply: response.output_text || "I'm here with you. Tell me more.", model });
  } catch (error) {
    console.error("ZEVANI /api/chat error:", error);
    return res.status(500).json({ error: "The AI could not respond right now. Please try again." });
  }
}
