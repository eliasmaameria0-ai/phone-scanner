// Crée TOUT le serveur Discord en 1 commande : catégories + 50+ salons.
// Usage : DISCORD_TOKEN=xxx GUILD_ID=yyy node setup-server.js
import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import { IPHONES, CATEGORIES } from "./config-iphones.js";

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
if (!TOKEN || !GUILD_ID) { console.error("❌ .env incomplet (DISCORD_TOKEN + GUILD_ID)"); process.exit(1); }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

client.once("ready", async () => {
  console.log("🤖 " + client.user.tag);
  const guild = await client.guilds.fetch(GUILD_ID);
  const existing = await guild.channels.fetch();
  const has = (name) => [...existing.values()].some((c) => c?.name === name);

  for (const cat of CATEGORIES) {
    let category = [...existing.values()].find((c) => c?.name === cat.name && c.type === ChannelType.GuildCategory);
    if (!category) {
      category = await guild.channels.create({ name: cat.name, type: ChannelType.GuildCategory });
      console.log("📁 " + cat.name);
      await sleep(500);
    }
    // salons fixes (info / communauté)
    for (const ch of cat.channels || []) {
      if (!has("📌・" + ch.slug) && !has("🔥・" + ch.slug) && !has("💬・" + ch.slug) && ![...existing.values()].some((c) => c?.name?.includes(ch.slug))) {
        const prefix = cat.name.startsWith("📌") ? "📌・" : cat.name.startsWith("🔥") ? "🔥・" : "💬・";
        await guild.channels.create({ name: prefix + ch.slug, topic: ch.label, parent: category.id });
        console.log("  + " + prefix + ch.slug);
        await sleep(400);
      }
    }
    // 1 salon par iPhone
    for (const slug of cat.slugs || []) {
      const model = IPHONES.find((m) => m.slug === slug);
      const name = "📱・" + slug;
      if ([...existing.values()].some((c) => c?.name === name)) { console.log("  = " + name + " (existe)"); continue; }
      await guild.channels.create({ name, topic: `${model.label} — alertes Vinted auto (occasion ${model.price_min}-${model.price_max}€)`, parent: category.id });
      console.log("  + " + name);
      await sleep(400); // anti rate-limit
    }
  }
  console.log("\n✅ Serveur prêt ! Lance ensuite : npm start");
  process.exit(0);
});

client.login(TOKEN);
