import "dotenv/config";
import { Client, GatewayIntentBits, ChannelType, EmbedBuilder } from "discord.js";
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TEXTS = {
  "règles": { title: "📌 Règles du serveur", desc: "1️⃣ Pas d'arnaque, pas de faux liens\n2️⃣ Prix bas uniquement (bot auto)\n3️⃣ Vérifie toujours l'état iCloud + IMEI avant d'acheter\n4️⃣ Pas de pub sans accord\n5️⃣ Reste courtois\n\n⚠️ Les annonces sont auto (Vinted). Le staff ne vend rien directement." },
  "annonces": { title: "📢 Annonces", desc: "Bienvenue sur **Phone Scanner** 📱\n\n🤖 Bot actif 24/7 (mode PC, prix bas 40% du marché)\n✅ 51 salons iPhone (2G → 17 Pro Max)\n🔥 Pépites <200€ dans 🔥・bon-plans-global\n\nProchaine étape : ouvre les alertes du salon de ton modèle (Clic droit → Suivre)." },
  "comment-chercher": { title: "🔍 Comment chercher", desc: "1️⃣ Va dans le salon de ton modèle (ex: 📱・iphone-13)\n2️⃣ Active les notifs : Clic droit salon → Paramètres de notification → Tous les messages\n3️⃣ Clique vite sur le lien Vinted (les pépites partent en <5 min)\n4️⃣ Check : photos réelles, compte vendeur noté, pas de prix cassé -50% (arnaque)\n5️⃣ Demande IMEI + test iCloud en vidéo avant paiement." },
  "bon-plans-global": { title: "🔥 Bon plans global", desc: "Ici arrivent auto les pépites ≤200€ tous modèles. Laisse les notifs ON." },
  "pépites-moins-200": { title: "💎 Pépites -200€", desc: "Salon auto : que les iPhone à moins de 200€. Premiers arrivés, premiers servis." },
  "discussion": { title: "💬 Discussion", desc: "Parle ici : quel iPhone chercher ? Quel budget ? Entraide bienvenue 🙌" },
  "estimation-prix": { title: "💰 Estimation prix", desc: "Envoie : modèle + stockage + état batterie + photos → la commu t'estime le juste prix.\nEx: 13 128Go 89% rayure écran → ~280€" },
  "arnaques-à-éviter": { title: "⚠️ Arnaques à éviter", desc: "❌ Prix -50% du marché = faux\n❌ Vendeur 0 avis qui demande hors Vinted\n❌ iCloud verrouillé / MDM entreprise\n❌ Photos catalogue, pas réelles\n✅ Toujours payer via Vinted (protection acheteur)." },
};

client.once("ready", async () => {
  const guild = await client.guilds.fetch(GUILD_ID);
  const all = await guild.channels.fetch();
  for (const [slug, t] of Object.entries(TEXTS)) {
    const ch = [...all.values()].find((c) => c?.type === ChannelType.GuildText && c.name.includes(slug));
    if (!ch) { console.log("skip " + slug); continue; }
    const msgs = await ch.messages.fetch({ limit: 5 }).catch(() => null);
    if (msgs && msgs.size > 0) { console.log("= " + ch.name + " déjà rempli"); continue; }
    await ch.send({ embeds: [new EmbedBuilder().setTitle(t.title).setDescription(t.desc).setColor(0x00ccff)] }).catch((e) => console.error(slug, e.message));
    console.log("+ " + ch.name);
  }
  process.exit(0);
});
client.login(TOKEN);
