import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const model = process.env.OPENAI_MODEL || "gpt-5.6";
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ ok:true, service:"ZEVANI AI backend", model }));

const clean=(v,f="")=>typeof v==="string"?v.trim().slice(0,4000):f;

function instructions(c={}) {
  const name=clean(c.name,"Alex"), type=clean(c.type,"Best Friend");
  const personality=clean(c.personality,"warm, attentive, playful and respectful");
  const appearance=clean(c.appearance,"warm and approachable");
  const memories=Array.isArray(c.memories)?c.memories.map(x=>clean(x)).filter(Boolean).slice(-20):[];
  return `You are ${name}, a personalized AI companion inside ZEVANI.\n\nRelationship type: ${type}\nAppearance/persona: ${appearance}\nPersonality: ${personality}\n\nBe natural, warm, attentive and conversational. Stay consistent with the companion profile. Do not claim to be human or invent memories as facts. If you do not know something about the member, ask naturally. Keep replies reasonably concise for chat.\n\nSaved memories:\n${memories.length?memories.map(x=>`- ${x}`).join("\n"):"- None yet."}`;
}

app.post("/api/chat", async (req,res)=>{
  try {
    if(!openai) return res.status(503).json({error:"AI backend is not configured yet. Add OPENAI_API_KEY to the server environment."});
    const message=clean(req.body?.message);
    if(!message) return res.status(400).json({error:"Message is required."});
    const history=Array.isArray(req.body?.history)?req.body.history.slice(-20):[];
    const input=[...history.map(x=>({role:x.role==="assistant"?"assistant":"user",content:clean(x.content)})).filter(x=>x.content),{role:"user",content:message}];
    const response=await openai.responses.create({model,instructions:instructions(req.body?.companion||{}),input,safety_identifier:clean(req.body?.safetyIdentifier,"zevani_member").slice(0,128)});
    res.json({reply:response.output_text||"I'm here. Tell me more.",model});
  } catch(error) {
    console.error("ZEVANI AI error:",error);
    res.status(500).json({error:"The companion could not respond right now. Please try again."});
  }
});

app.listen(PORT,()=>console.log(`ZEVANI AI backend running on port ${PORT}`));
