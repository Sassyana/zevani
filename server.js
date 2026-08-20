import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = file => fs.readFile(path.join(__dirname, file), "utf8");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

async function html(file, res) { try { res.type("html").send(await read(file)); } catch (e) { console.error(e); res.status(404).send("ZEVANI page not found."); } }

// MAIN ZEVANI HOME — this is the page containing the Companions section.
app.get("/", async (_req,res) => html("index-current.html",res));
app.get("/index.html", async (_req,res) => html("index-current.html",res));
app.get("/home.html", async (_req,res) => html("index-current.html",res));
app.get("/index-current.html", async (_req,res) => html("index-current.html",res));

// SEPARATE COMPANION LIBRARY FLOW — never replace or redirect this with the home page.
app.get("/rebuild", async (_req,res) => html("rebuild/index.html",res));
app.get("/rebuild/", async (_req,res) => html("rebuild/index.html",res));
app.get("/rebuild/index.html", async (_req,res) => html("rebuild/index.html",res));
app.get("/rebuild/library.html", async (_req,res) => html("rebuild/library.html",res));
app.get("/rebuild/meet.html", async (_req,res) => html("rebuild/meet.html",res));

for (const [route,file,type] of [
  ["/companion-library.css","companion-library.css","text/css"],
  ["/companion-library.js","companion-library.js","application/javascript"],
  ["/companion-gender-pronouns.js","companion-gender-pronouns.js","application/javascript"],
  ["/companion-avatar-sync.js","companion-avatar-sync.js","application/javascript"],
  ["/companion-save-profile.js","companion-save-profile.js","application/javascript"],
  ["/auth-voice-bridge.js","auth-voice-bridge.js","application/javascript"]
]) app.get(route, async (_req,res) => { try { res.type(type).send(await read(file)); } catch { res.status(404).send("Not found"); } });

app.get("/meet", async (_req,res) => html("meet/index.html",res));
app.get("/meet/", async (_req,res) => html("meet/index.html",res));
app.get("/meet.html", async (_req,res) => html("meet/index.html",res));
app.get("/api/health", (_req,res) => res.json({ ok:true, service:"ZEVANI AI backend", aiConfigured:!!openai }));
function clean(v,f=""){return typeof v==="string"?v.trim().slice(0,4000):f}
function companionInstructions(c={}){return `You are ${clean(c.name,"Alex")}, a personalized AI companion inside ZEVANI.\nRelationship type: ${clean(c.type,"Best Friend")}\nGender identity: ${clean(c.gender)}\nPronouns: ${clean(c.pronouns)}\nPersonality: ${clean(c.personality,"warm, attentive, playful and respectful")}\nHave natural, engaging conversations consistent with this profile. Be warm and emotionally supportive. Do not claim to be human or invent memories.`}
app.post("/api/chat",async(req,res)=>{try{if(!openai)return res.status(503).json({error:"AI backend is not configured yet. Add OPENAI_API_KEY to the server environment."});const c=req.body?.companion||{},m=clean(req.body?.message);if(!m)return res.status(400).json({error:"Message is required."});const h=Array.isArray(req.body?.history)?req.body.history.slice(-20):[];const input=[...h.map(i=>({role:i.role==="assistant"?"assistant":"user",content:clean(i.content)})).filter(i=>i.content),{role:"user",content:m}];const r=await openai.responses.create({model:process.env.OPENAI_MODEL||"gpt-5.6",instructions:companionInstructions(c),input});res.json({reply:r.output_text||"I'm here. Tell me more."})}catch(e){console.error(e);res.status(500).json({error:"The companion could not respond right now. Please try again."})}});

export default app;
if (process.env.NODE_ENV !== "production") app.listen(PORT,()=>console.log(`ZEVANI AI backend running on port ${PORT}`));
