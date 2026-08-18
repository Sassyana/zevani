import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REBUILD_URL = "https://raw.githubusercontent.com/Sassyana/zevani/zevani-rebuild-test/index-rebuild.html";

if (!process.env.OPENAI_API_KEY) console.warn("OPENAI_API_KEY is not set. AI chat will not work until configured.");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

async function sendApp(req, res) {
  try {
    const host = String(req.headers.host || "").split(":")[0].toLowerCase();
    const rebuild = host === "zevani-rebuild.vercel.app" || host.startsWith("zevani-rebuild-");
    let html;
    if (rebuild) {
      const response = await fetch(REBUILD_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Rebuild fetch failed: ${response.status}`);
      html = await response.text();
    } else {
      html = await fs.readFile(path.join(__dirname, "index-current.html"), "utf8");
      html = html.replace("</head>", '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><link rel="stylesheet" href="/companion-library.css"><script src="/auth-voice-bridge.js"></script><script defer src="/companion-library.js"></script><script defer src="/companion-gender-pronouns.js"></script><script defer src="/companion-avatar-sync.js"></script></head>');
    }
    res.type("html").send(html);
  } catch (error) { console.error("ZEVANI frontend error:", error); res.status(500).send("ZEVANI could not load the frontend."); }
}
app.get("/", sendApp);
app.get("/index-current.html", sendApp);
for (const [route, file, type] of [["/auth-voice-bridge.js","auth-voice-bridge.js","application/javascript"],["/companion-library.css","companion-library.css","text/css"],["/companion-library.js","companion-library.js","application/javascript"],["/companion-gender-pronouns.js","companion-gender-pronouns.js","application/javascript"],["/companion-avatar-sync.js","companion-avatar-sync.js","application/javascript"]]) app.get(route, async (_req,res)=>{try{const data=await fs.readFile(path.join(__dirname,file),"utf8");res.type(type).send(data)}catch{res.status(404).send("Not found")}});
app.get("/api/health", (_req,res)=>res.json({ok:true,service:"ZEVANI AI backend",aiConfigured:!!openai}));
function clean(value,fallback=""){return typeof value==="string"?value.trim().slice(0,4000):fallback}
function companionInstructions(c={}){const name=clean(c.name,"Alex"),type=clean(c.type,"Best Friend"),appearance=clean(c.appearance,"warm and approachable"),personality=clean(c.personality,"warm, attentive, playful and respectful"),gender=clean(c.gender,""),pronouns=clean(c.pronouns,""),memories=Array.isArray(c.memories)?c.memories.map(m=>clean(m)).filter(Boolean).slice(-20):[];return `You are ${name}, a personalized AI companion inside ZEVANI.\n\nRelationship type: ${type}\nGender identity: ${gender}\nPronouns: ${pronouns}\nAppearance/persona description: ${appearance}\nPersonality: ${personality}\n\nHave natural, engaging conversations consistent with this profile. Be warm, attentive, conversational and emotionally supportive. Use stated pronouns consistently. Do not claim to be human or invent memories.\n\nRelevant saved memories:\n${memories.length?memories.map(m=>`- ${m}`).join("\n"):"- No saved memories yet."}`}
app.post("/api/chat",async(req,res)=>{try{if(!openai)return res.status(503).json({error:"AI backend is not configured yet. Add OPENAI_API_KEY to the server environment."});const companion=req.body?.companion||{},message=clean(req.body?.message),history=Array.isArray(req.body?.history)?req.body.history.slice(-20):[];if(!message)return res.status(400).json({error:"Message is required."});const input=[...history.map(i=>({role:i.role==="assistant"?"assistant":"user",content:clean(i.content).slice(0,4000)})).filter(i=>i.content),{role:"user",content:message}];const response=await openai.responses.create({model:process.env.OPENAI_MODEL||"gpt-5.6",instructions:companionInstructions(companion),input,safety_identifier:clean(req.body?.safetyIdentifier,"zevani_member").slice(0,128)});res.json({reply:response.output_text||"I'm here. Tell me more.",model:process.env.OPENAI_MODEL||"gpt-5.6"})}catch(error){console.error("ZEVANI AI error:",error);res.status(500).json({error:"The companion could not respond right now. Please try again."})}});
app.listen(PORT,()=>console.log(`ZEVANI AI backend running on port ${PORT}`));
