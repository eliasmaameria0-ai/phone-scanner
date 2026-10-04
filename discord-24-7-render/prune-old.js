import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const OLD = "iphone-2g,iphone-3g,iphone-3gs,iphone-4,iphone-4s,iphone-5,iphone-5c,iphone-5s,iphone-6,iphone-6-plus,iphone-6s,iphone-6s-plus,iphone-se-2016,iphone-7,iphone-7-plus,iphone-8,iphone-8-plus,iphone-x,iphone-xr,iphone-xs,iphone-xs-max,iphone-11,iphone-11-pro,iphone-11-pro-max,iphone-se-2020".split(",");
client.once("ready", async () => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const all = await guild.channels.fetch();
  for (const slug of OLD) {
    const ch = [...all.values()].find((c) => c?.name?.includes(slug));
    if (!ch) continue;
    try { await ch.delete("prune <12"); console.log("- " + ch.name); } catch (e) { console.error(slug, e.message); }
    await new Promise((r) => setTimeout(r, 500));
  }
  // supprime les catégories vides vintage/11
  const fresh = await guild.channels.fetch();
  for (const c of [...fresh.values()]) {
    if (c?.type === 4 && (c.name.includes("VINTAGE") || c.name.includes("11"))) {
      const kids = [...fresh.values()].filter((k) => k.parentId === c.id);
      if (!kids.length) { await c.delete().catch(() => {}); console.log("x " + c.name); }
    }
  }
  process.exit(0);
});
client.login(process.env.DISCORD_TOKEN);
