# 📱 Serveur Discord iPhone + Bot Vinted 24/7 GRATUIT — Guide 10 min

## 1. Crée le serveur Discord (2 min)
1. Discord -> `+` -> Créer un serveur -> `iPhone Bon Plans`
2. Paramètres -> Avancés -> active **Mode développeur**
3. Clic droit sur le serveur -> **Copier l'identifiant** -> colle dans `.env` (GUILD_ID)

## 2. Crée le bot Discord (3 min)
1. Va sur https://discord.com/developers/applications -> New Application
2. Onglet **Bot** -> Reset Token -> copie -> colle dans `.env` (DISCORD_TOKEN)
3. Onglet **OAuth2 -> URL Generator** : coche `bot` + permission `Administrator`
4. Ouvre l'URL générée -> invite le bot sur ton serveur
5. Remonte le rôle du bot en haut (Paramètres serveur -> Rôles)

## 3. Crée les 50+ salons en 1 commande (1 min)
```bash
cd bot-iphone/discord-24-7
npm install
copy .env.example .env   # puis remplis TOKEN + GUILD_ID dans .env
npm run setup
```
Résultat :
- 📌・INFO : règles, annonces, comment-chercher
- 🔥・AFFAIRES : bon-plans-global, pépites-moins-200
- 📱・VINTAGE 2G → X (21 salons)
- 📱・iPHONE 11 → 13 (13 salons)
- 📱・iPHONE 14 → 15 (8 salons)
- 📱・iPHONE 16 → 17 (9 salons : 16, 16 Plus, 16 Pro, 16 Pro Max, 16e, 17, 17 Air, 17 Pro, 17 Pro Max)
- 🤝・COMMUNAUTÉ : discussion, estimation-prix, arnaques-à-éviter

Teste en local : `npm start` -> "Connecté" + messages dans les salons.

## 4. Mets-le 24/7 GRATUIT sur Render (4 min)
1. Mets ce dossier sur GitHub (drag & drop sur github.com/new)
2. Va sur https://render.com -> New -> Blueprint -> lie ton repo (render.yaml détecté)
3. Renseigne DISCORD_TOKEN + GUILD_ID -> Deploy
4. Va sur https://uptimerobot.com -> Add Monitor -> HTTP -> colle l'URL Render -> toutes les 5 min (empêche la mise en veille du plan gratuit)

C'est en ligne H24. Logs visibles sur Render.

## ⚠️ Vérité à savoir (important)
- Le plan gratuit Render dort après 15 min sans visite -> UptimeRobot le réveille, micro-coupures possibles (~1 min).
- Vinted bloque parfois les IP datacenter (erreur 403) : le bot rafraîchit son cookie et réessaie. Si ça bloque trop, passe à un VPS à 3€/mois ou laisse ton PC allumé avec `npm start`.
- 50 recherches x 60s = ~50 requêtes/min -> on espace à 1,5s entre chaque pour ne pas se faire bannir. Ne descends pas sous 45s d'intervalle.

## Commandes
- `npm run setup` : créer les salons
- `npm start` : lancer le bot
