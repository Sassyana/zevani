export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    service: "ZEVANI AI backend",
    aiConfigured: !!process.env.OPENAI_API_KEY,
    route: "/api/chat"
  });
}
