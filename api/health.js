import OpenAI from "openai";

export default async function handler(_req, res) {
  const keyConfigured = !!process.env.OPENAI_API_KEY;
  if (!keyConfigured) {
    return res.status(200).json({
      ok: true,
      service: "ZEVANI AI backend",
      aiConfigured: false,
      openaiReachable: false,
      route: "/api/chat"
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await client.models.list();
    return res.status(200).json({
      ok: true,
      service: "ZEVANI AI backend",
      aiConfigured: true,
      openaiReachable: true,
      route: "/api/chat"
    });
  } catch (error) {
    return res.status(200).json({
      ok: true,
      service: "ZEVANI AI backend",
      aiConfigured: true,
      openaiReachable: false,
      openaiError: error?.error?.message || error?.message || "OpenAI connection failed",
      route: "/api/chat"
    });
  }
}
