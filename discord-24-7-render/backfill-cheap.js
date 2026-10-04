// Remplit chaque salon avec ses 2 moins chères actuelles (1 seul passage)
import "dotenv/config";
import { Client, GatewayIntentBits, EmbedBuilder, ChannelType } from "discord.js";
import { IPHONES, BLACKLIST } from "./config-iphones.js";
import { scrapeVintedPool, closeBrowser } from "../browser.js";

const LOW = Number(process.env.LOW_FACTOR || 0.7);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

client.once("ready", async () => {
  console.log("Backfill prix bas x" + LOW);
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const all = await guild.channels.fetch();
  const searches = IPHONES.map((m) => ({ keywords: m.keywords, price_min: m.price_min, price_max: Math.round(m.price_max * LOW) }));
  const { items, errors } = await scrapeVintedPool(searches, 2);
  console.log(items.length + " vues, " + errors.length + " erreurs");
  errors.slice(0, 5).forEach((e) => console.log("ERR " + e.keywords + " : " + e.error));
  const byKw = {};
  items.forEach((it) => { (byKw[it.keywords] = byKw[it.keywords] || []).push(it); });
  for (const m of IPHONES) {
    const arr = (byKw[m.keywords] || [])
      .filter((it) => (it.title || "").toLowerCase().includes("iphone"))
      .filter((it) => !BLACKLIST.some((b) => b && (it.title || "").toLowerCase().includes(b)))
      .sort((a, b) => a.price - b.price)
      .slice(0, 2);
    if (!arr.length) { console.log("- " + m.slug + " : rien"); continue; }
    const ch = [...all.values()].find((c) => c?.type === ChannelType.GuildText && c.name.includes(m.slug));
    if (!ch) continue;
    for (const it of arr) {
      await ch.send({ content: `💰 **Prix bas** — ${m.label} à **${it.price}€**`, embeds: [new EmbedBuilder().setTitle(("📱 " + it.title).slice(0, 256)).setURL(it.url).setDescription(`**${it.price}€** — ${m.label}\n🔗 [Voir sur Vinted](${it.url})`).setColor(0x00ff88).setImage(it.image || null).setTimestamp(new Date())] }).catch(() => {});
      await sleep(500);
    }
    console.log("+ " + m.slug + " : " + arr.map((x) => x.price + "€").join(", "));
    await sleep(400);
  }
  await closeBrowser();
  process.exit(0);
});
client.login(process.env.DISCORD_TOKEN);
