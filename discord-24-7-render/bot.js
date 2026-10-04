// Vrai bot Vinted -> Discord : 1 salon par iPhone, tourne 24/7 gratuit sur Render.
// Léger (pas de Chrome) : utilise l'API catalogue Vinted, parfait pour l'offre gratuite.
import "dotenv/config";
import { Client, GatewayIntentBits, EmbedBuilder, ChannelType } from "discord.js";
import fs from "node:fs";
import { IPHONES, BLACKLIST } from "./config-iphones.js";

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const INTERVAL = Math.max(45, Number(process.env.INTERVAL_SECONDS || 60));
const DEALS_ONLY = String(process.env.DEALS_ONLY || "false") === "true";
if (!TOKEN || !GUILD_ID) { console.error("❌ Mets DISCORD_TOKEN et GUILD_ID dans .env (voir .env.example)"); process.exit(1); }

const SEEN_PATH = "./seen-discord.json";
const seen = new Set(JSON.parse(fs.existsSync(SEEN_PATH) ? fs.readFileSync(SEEN_PATH, "utf8") : "[]"));
const saveSeen = () => fs.writeFileSync(SEEN_PATH, JSON.stringify([...seen].slice(-3000)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Session Vinted (cookie anonyme, rafraîchi si 403) ---
let cookie = "";
async function refreshCookie() {
  const r = await fetch("https://www.vinted.fr/", { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122 Safari/537.36" } });
  const set = r.headers.get("set-cookie") || "";
  const m = set.match(/_vinted_fr_session=[^;]+/);
  if (m) cookie = m[0];
  // fallback : cookie générique même sans set-cookie
  if (!cookie) cookie = "_vinted_fr_session=anon";
}
await refreshCookie().catch(() => { cookie = "_vinted_fr_session=anon"; });

async function searchVinted(model) {
  const params = new URLSearchParams({
    search_text: model.keywords,
    order: "newest_first",
    per_page: "20",
    price_from: String(model.price_min || ""),
    price_to: String(model.price_max || ""),
  });
  const url = "https://www.vinted.fr/api/v2/catalog/items?" + params;
  const res = await fetch(url, { headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122 Safari/537.36",
    "Accept": "application/json",
    "Cookie": cookie,
  }});
  if (res.status === 401 || res.status === 403) { await refreshCookie(); throw new Error(`Vinted ${res.status} (IP datacenter limitée, réessai)`); }
  if (!res.ok) throw new Error("Vinted HTTP " + res.status);
  const json = await res.json();
  return (json.items || []).map((it) => ({
    id: "vinted-" + it.id,
    title: it.title || model.keywords,
    price: Number(it.price?.amount ?? it.price ?? 0),
    url: "https://www.vinted.fr/items/" + it.id,
    image: it.photo?.url || it.photos?.[0]?.url || null,
    brand: it.brand_title || "",
  }));
}

function passesFilters(item, model) {
  const t = (item.title || "").toLowerCase();
  if (!t.includes("iphone")) return false;
  for (const bad of BLACKLIST) if (bad && t.includes(bad)) return false;
  if (!item.price || item.price <= 0) return false;
  if (model.price_min && item.price < model.price_min * 0.5) return false; // suspect
  if (model.price_max && item.price > model.price_max) return false;
  return true;
}

// --- Discord ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const channelCache = new Map(); // slug -> channel

async function resolveChannels() {
  const guild = await client.guilds.fetch(GUILD_ID);
  const channels = await guild.channels.fetch();
  for (const model of IPHONES) {
    const found = [...channels.values()].find((c) => c?.type === ChannelType.GuildText && c.name.includes(model.slug));
    if (found) channelCache.set(model.slug, found);
  }
  const global = [...channels.values()].find((c) => c?.type === ChannelType.GuildText && c.name.includes("bon-plans-global"));
  if (global) channelCache.set("__global", global);
  console.log(`✅ ${channelCache.size} salons liés (dont global: ${channelCache.has("__global")})`);
}

function embedFor(item, model) {
  return new EmbedBuilder()
    .setTitle(`📱 ${item.title}`.slice(0, 256))
    .setURL(item.url)
    .setDescription(`**${item.price}€** — ${model.label}\n🔗 [Voir sur Vinted](${item.url})`)
    .setColor(item.price <= model.price_min ? 0x00ff88 : 0x0099ff)
    .setFooter({ text: `Vinted • ${model.keywords} • ${new Date().toLocaleTimeString("fr-FR")}` })
    .setTimestamp(item.image ? undefined : new Date())
    .setImage(item.image || null);
}

let scanning = false;
async function scanOnce(first = false) {
  if (scanning) return;
  scanning = true;
  let fresh = 0;
  for (const model of IPHONES) {
    try {
      const items = await searchVinted(model);
      for (const it of items) {
        if (seen.has(it.id) || !passesFilters(it, model)) continue;
        seen.add(it.id);
        if (first) continue; // 1er passage = init silencieuse, pas de spam
        const ch = channelCache.get(model.slug);
        if (!ch) continue;
        const isDeal = it.price <= model.price_min * 1.2;
        if (DEALS_ONLY && !isDeal) continue;
        await ch.send({ content: isDeal ? "🔥 **AFFAIRE**" : "🆕 Nouveau", embeds: [embedFor(it, model)] }).catch(() => {});
        // pépite globale si vraiment pas cher
        if (it.price <= 200 && channelCache.has("__global")) {
          await channelCache.get("__global").send({ content: `💎 ${model.label} à **${it.price}€**`, embeds: [embedFor(it, model)] }).catch(() => {});
        }
        fresh++;
        await sleep(600); // anti rate-limit Discord
      }
    } catch (e) { console.error(`[${model.slug}] ${e.message}`); }
    await sleep(1500); // anti rate-limit Vinted (~50 req/min max)
  }
  saveSeen(seen);
  console.log(`[${new Date().toLocaleTimeString("fr-FR")}] scan fini : ${fresh} nouveauté(s)`);
  scanning = false;
}

client.once("ready", async () => {
  console.log(`🤖 Connecté : ${client.user.tag}`);
  await resolveChannels();
  console.log("Premier passage (init silencieuse)...");
  await scanOnce(true);
  saveSeen(seen);
  console.log(`Boucle toutes les ${INTERVAL}s. Laisse tourner 24/7 sur Render.`);
  setInterval(() => scanOnce(false).catch((e) => console.error(e.message)), INTERVAL * 1000);
});

// petit serveur HTTP pour Render free (health check + anti-sleep) + UptimeRobot
import http from "node:http";
http.createServer((req, res) => { res.writeHead(200); res.end("OK " + new Date().toISOString()); }).listen(process.env.PORT || 3000);

client.login(TOKEN);
