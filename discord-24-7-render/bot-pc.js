// Version PC 24/7 zéro-coupure : vrai Chrome + IP maison (Vinted ne bloque pas).
// A laisser tourner sur ton PC allumé. Consomme peu, redémarre tout seul.
import "dotenv/config";
import { Client, GatewayIntentBits, EmbedBuilder, ChannelType } from "discord.js";
import fs from "node:fs";
import { IPHONES, BLACKLIST } from "./config-iphones.js";
import { scrapeVintedPool, closeBrowser } from "./browser.js";

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const INTERVAL = Math.max(60, Number(process.env.INTERVAL_SECONDS || 90));
const LOW_FACTOR = Number(process.env.LOW_FACTOR || 0.55);
const MIN_MODEL = process.env.MIN_MODEL || "iphone-12-mini";
const cutIdx = IPHONES.findIndex((x) => x.slug === MIN_MODEL);
const ACTIVE = cutIdx >= 0 ? IPHONES.slice(cutIdx) : IPHONES;
console.log(`⚡ Mode rapide : ${ACTIVE.length}/${IPHONES.length} modèles (dès ${MIN_MODEL})`);
if (!TOKEN || !GUILD_ID || GUILD_ID.includes("colle")) { console.error("❌ .env incomplet"); process.exit(1); }

const SEEN_PATH = "./seen-discord.json";
const seen = new Set(JSON.parse(fs.existsSync(SEEN_PATH) ? fs.readFileSync(SEEN_PATH, "utf8") : "[]"));
const saveSeen = () => fs.writeFileSync(SEEN_PATH, JSON.stringify([...seen].slice(-4000)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function passes(item, model) {
  const t = (item.title || "").toLowerCase();
  if (!t.includes("iphone")) return false;
  for (const bad of BLACKLIST) if (bad && t.includes(bad)) return false;
  if (!item.price || item.price <= 0) return false;
  if (model.price_min && item.price < model.price_min * 0.4) return false;
  // MODE PRIX BAS : on ne garde que ~55% du plafond normal
  const lowMax = Math.round(model.price_max * LOW_FACTOR);
  if (item.price > lowMax) return false;
  return true;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const chCache = new Map();

async function resolve() {
  const guild = await client.guilds.fetch(GUILD_ID);
  const all = await guild.channels.fetch();
  for (const m of ACTIVE) {
    const f = [...all.values()].find((c) => c?.type === ChannelType.GuildText && c.name.includes(m.slug));
    if (f) chCache.set(m.slug, f);
  }
  const g = [...all.values()].find((c) => c?.type === ChannelType.GuildText && c.name.includes("bon-plans-global"));
  if (g) chCache.set("__global", g);
  console.log(`✅ ${chCache.size} salons liés`);
}

function embed(item, model) {
  return new EmbedBuilder()
    .setTitle(`📱 ${item.title}`.slice(0, 256))
    .setURL(item.url)
    .setDescription(`**${item.price}€** — ${model.label}\n🔗 [Voir sur Vinted](${item.url})`)
    .setColor(0x0099ff)
    .setImage(item.image || null)
    .setFooter({ text: `Vinted • ${model.keywords}` })
    .setTimestamp(new Date());
}

let scanning = false;
async function scan(first = false) {
  if (scanning) return;
  scanning = true;
  try {
    const searches = ACTIVE.map((m) => ({ keywords: m.keywords, price_min: m.price_min, price_max: m.price_max }));
    const { items, errors } = await scrapeVintedPool(searches, 2);
    errors.forEach((e) => console.error(`[${e.keywords}] ${e.error}`));
    const byKw = {};
    items.forEach((it) => { (byKw[it.keywords] = byKw[it.keywords] || []).push(it); });
    let fresh = 0;
    for (const m of ACTIVE) {
      for (const it of byKw[m.keywords] || []) {
        const id = it.id + "|" + m.slug;
        if (seen.has(id) || !passes(it, m)) continue;
        seen.add(id);
        if (first) continue;
        const ch = chCache.get(m.slug);
        if (!ch) continue;
        await ch.send({ content: "🆕 Nouveau", embeds: [embed(it, m)] }).catch(() => {});
        if (it.price <= 200 && chCache.has("__global"))
          await chCache.get("__global").send({ content: `💎 ${m.label} à **${it.price}€**`, embeds: [embed(it, m)] }).catch(() => {});
        fresh++;
        await sleep(500);
      }
    }
    saveSeen(seen);
    console.log(`[${new Date().toLocaleTimeString("fr-FR")}] ${fresh} nouveauté(s), ${items.length} vues`);
  } finally { scanning = false; await closeBrowser().catch(() => {}); }
}

client.once("ready", async () => {
  console.log("🤖 " + client.user.tag + " (mode PC Chrome)");
  await resolve();
  console.log("Init silencieuse (pas de spam)...");
  await scan(true);
  saveSeen(seen);
  setInterval(() => scan(false).catch((e) => console.error(e.message)), INTERVAL * 1000);
});

import http from "node:http";
const HEALTH_PORT = Number(process.env.PORT || 3001);
http.createServer((req, res) => { res.writeHead(200); res.end("OK"); }).listen(HEALTH_PORT).on("error", () => {});
client.login(TOKEN);

// relance auto si crash (sauf port occupé = autre instance déjà en route)
process.on("uncaughtException", (e) => { console.error("CRASH:", e.message); if (String(e.message).includes("EADDRINUSE")) { console.error("Autre bot déjà lancé, je stoppe ce doublon."); process.exit(0); } setTimeout(() => process.exit(1), 2000); });
