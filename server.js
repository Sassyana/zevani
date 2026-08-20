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
const injectSave = html => html.replace("</head>", '<script defer src="/companion-save-profile.js"></script></head>');
if (!process.env.OPENAI_API_KEY) console.warn("OPENAI_API_KEY is not set. AI chat will not work until configured.");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
async function sendApp(req,res){try{const host=String(req.headers.host||"").split(":")[0].toLowerCase();const rebuild=host==="zevani-rebuild.vercel.app"||host.startsWith("zevani-rebuild-");let html;if(rebuild){const r=await fetch(REBUILD_URL,{cache:"no-store"});if(!r.ok)throw new Error(`Rebuild fetch failed: ${r.status}`);html=injectSave(await r.text())}else{html=await fs.readFile(path.join(__dirname,"index-current.html"),"utf8");html=html.replace("</head>",'<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><link rel="stylesheet" href="/companion-library.css"><script src="/auth-voice-bridge.js"></script><script defer src="/companion-library.js"></script><script defer src="/companion-gender-pronouns.js"></script><script defer src="/companion-avatar-sync.js"></script><script defer src="/companion-save-profile.js"></script></head>')}res.type("html").send(html)}catch(e){console.error(e);res.status(500).send("ZEVANI could not load the frontend.")}}
app.get("/",sendApp);app.get("/index-current.html",sendApp);
async function sendMeet(req,res){try{const html=await fs.readFile(path.join(__dirname,"meet","index.html"),"utf8");res.type("html").send(html)}catch(e){res.status(500).send("ZEVANI could not load the companion chat.")}}
app.get("/meet",sendMeet);app.get("/meet/",sendMeet);
async function sendLibrary(req,res){try{const html=await fs.readFile(path.join(__dirname,"rebuild","index.html"),"utf8");res.type("html").send(html)}catch(e){res.status(500).send("ZEVANI could not load the companion library.")}}
app.get("/rebuild",sendLibrary);app.get("/rebuild/",sendLibrary);
for(const [route,file,type] of [["/auth-voice-bridge.js","auth-voice-bridge.js","application/javascript"],["/companion-library.css","companion-library.css","text/css"],["/companion-library.js","companion-library.js","application/javascript"],["/companion-gender-pronouns.js","companion-gender-pronouns.js","application/javascript"],["/companion-avatar-sync.js","companion-avatar-sync.js","application/javascript"],["/companion-save-profile.js","companion-save-profile.js","application/javascript"]])app.get(route,async(_req,res)=>{try{const data=await fs.readFile(path.join(__dirname,file),"utf8");res.type(type).send(data)}catch{res.status(404).send("Not found")}});
app.get("/api/health",(_req,res)=>res.json({ok:true,service:"ZEVANI AI backend",aiConfigured:!!openai}));
function clean(v,f=""){return typeof v==="string"?v.trim().slice(0,4000):f}function companionInstructions(c={}){return `You are ${clean(c.name,"Alex")}, a personalized AI companion inside ZEVANI.\nRelationship type: ${clean(c.type,"Best Friend")}\nGender identity: ${clean(c.gender)}\nPronouns: ${clean(c.pronouns)}\nPersonality: ${clean(c.personality,"warm, attentive, playful and respectful")}\nHave natural, engaging conversations consistent with this profile. Be warm and emotionally supportive. Do not claim to be human or invent memories.`}
app.post("/api/chat",async(req,res)=>{try{if(!openai)return res.status(503).json({error:"AI backend is not configured yet. Add OPENAI_API_KEY to the server environment."});const c=req.body?.companion||{},m=clean(req.body?.message);if(!m)return res.status(400).json({error:"Message is required."});const h=Array.isArray(req.body?.history)?req.body.history.slice(-20):[];const input=[...h.map(i=>({role:i.role==="assistant"?"assistant":"user",content:clean(i.content)})).filter(i=>i.content),{role:"user",content:m}];const r=await openai.responses.create({model:process.env.OPENAI_MODEL||"gpt-5.6",instructions:companionInstructions(c),input});res.json({reply:r.output_text||"I'm here. Tell me more."})}catch(e){console.error(e);res.status(500).json({error:"The companion could not respond right now. Please try again."})}});
app.listen(PORT,()=>console.log(`ZEVANI AI backend running on port ${PORT}`));
