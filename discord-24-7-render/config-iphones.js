// Tous les iPhone existants (2007 -> 2025). 1 entrée = 1 salon Discord.
// slug = nom du salon, keywords = recherche Vinted, prix = fourchette occase France.
export const IPHONES = [
  // --- Vintage (peu de volume, 1 salon groupé possible mais on garde 1/salon comme demandé) ---
  { slug: "iphone-2g", label: "iPhone 2G", keywords: "iphone 2g", price_min: 20, price_max: 500 },
  { slug: "iphone-3g", label: "iPhone 3G", keywords: "iphone 3g", price_min: 10, price_max: 150 },
  { slug: "iphone-3gs", label: "iPhone 3GS", keywords: "iphone 3gs", price_min: 10, price_max: 150 },
  { slug: "iphone-4", label: "iPhone 4", keywords: "iphone 4", price_min: 10, price_max: 120 },
  { slug: "iphone-4s", label: "iPhone 4S", keywords: "iphone 4s", price_min: 10, price_max: 120 },
  { slug: "iphone-5", label: "iPhone 5", keywords: "iphone 5", price_min: 10, price_max: 120 },
  { slug: "iphone-5c", label: "iPhone 5C", keywords: "iphone 5c", price_min: 10, price_max: 100 },
  { slug: "iphone-5s", label: "iPhone 5S", keywords: "iphone 5s", price_min: 10, price_max: 120 },
  { slug: "iphone-6", label: "iPhone 6", keywords: "iphone 6", price_min: 20, price_max: 150 },
  { slug: "iphone-6-plus", label: "iPhone 6 Plus", keywords: "iphone 6 plus", price_min: 20, price_max: 160 },
  { slug: "iphone-6s", label: "iPhone 6S", keywords: "iphone 6s", price_min: 20, price_max: 160 },
  { slug: "iphone-6s-plus", label: "iPhone 6S Plus", keywords: "iphone 6s plus", price_min: 20, price_max: 170 },
  { slug: "iphone-se-2016", label: "iPhone SE 2016", keywords: "iphone se 2016", price_min: 20, price_max: 150 },
  { slug: "iphone-7", label: "iPhone 7", keywords: "iphone 7", price_min: 30, price_max: 180 },
  { slug: "iphone-7-plus", label: "iPhone 7 Plus", keywords: "iphone 7 plus", price_min: 40, price_max: 200 },
  { slug: "iphone-8", label: "iPhone 8", keywords: "iphone 8", price_min: 40, price_max: 200 },
  { slug: "iphone-8-plus", label: "iPhone 8 Plus", keywords: "iphone 8 plus", price_min: 50, price_max: 230 },
  { slug: "iphone-x", label: "iPhone X", keywords: "iphone x", price_min: 60, price_max: 280 },
  { slug: "iphone-xr", label: "iPhone XR", keywords: "iphone xr", price_min: 60, price_max: 280 },
  { slug: "iphone-xs", label: "iPhone XS", keywords: "iphone xs", price_min: 70, price_max: 300 },
  { slug: "iphone-xs-max", label: "iPhone XS Max", keywords: "iphone xs max", price_min: 80, price_max: 330 },
  // --- Génération 11 ---
  { slug: "iphone-11", label: "iPhone 11", keywords: "iphone 11", price_min: 70, price_max: 320 },
  { slug: "iphone-11-pro", label: "iPhone 11 Pro", keywords: "iphone 11 pro", price_min: 100, price_max: 380 },
  { slug: "iphone-11-pro-max", label: "iPhone 11 Pro Max", keywords: "iphone 11 pro max", price_min: 120, price_max: 420 },
  { slug: "iphone-se-2020", label: "iPhone SE 2020", keywords: "iphone se 2020", price_min: 40, price_max: 220 },
  // --- Génération 12 ---
  { slug: "iphone-12-mini", label: "iPhone 12 mini", keywords: "iphone 12 mini", price_min: 80, price_max: 320 },
  { slug: "iphone-12", label: "iPhone 12", keywords: "iphone 12", price_min: 100, price_max: 380 },
  { slug: "iphone-12-pro", label: "iPhone 12 Pro", keywords: "iphone 12 pro", price_min: 150, price_max: 450 },
  { slug: "iphone-12-pro-max", label: "iPhone 12 Pro Max", keywords: "iphone 12 pro max", price_min: 180, price_max: 500 },
  // --- Génération 13 ---
  { slug: "iphone-13-mini", label: "iPhone 13 mini", keywords: "iphone 13 mini", price_min: 150, price_max: 400 },
  { slug: "iphone-13", label: "iPhone 13", keywords: "iphone 13", price_min: 180, price_max: 480 },
  { slug: "iphone-13-pro", label: "iPhone 13 Pro", keywords: "iphone 13 pro", price_min: 220, price_max: 580 },
  { slug: "iphone-13-pro-max", label: "iPhone 13 Pro Max", keywords: "iphone 13 pro max", price_min: 250, price_max: 620 },
  { slug: "iphone-se-2022", label: "iPhone SE 2022", keywords: "iphone se 2022", price_min: 80, price_max: 280 },
  // --- Génération 14 ---
  { slug: "iphone-14", label: "iPhone 14", keywords: "iphone 14", price_min: 220, price_max: 600 },
  { slug: "iphone-14-plus", label: "iPhone 14 Plus", keywords: "iphone 14 plus", price_min: 250, price_max: 650 },
  { slug: "iphone-14-pro", label: "iPhone 14 Pro", keywords: "iphone 14 pro", price_min: 320, price_max: 750 },
  { slug: "iphone-14-pro-max", label: "iPhone 14 Pro Max", keywords: "iphone 14 pro max", price_min: 380, price_max: 820 },
  // --- Génération 15 ---
  { slug: "iphone-15", label: "iPhone 15", keywords: "iphone 15", price_min: 320, price_max: 750 },
  { slug: "iphone-15-plus", label: "iPhone 15 Plus", keywords: "iphone 15 plus", price_min: 350, price_max: 800 },
  { slug: "iphone-15-pro", label: "iPhone 15 Pro", keywords: "iphone 15 pro", price_min: 450, price_max: 900 },
  { slug: "iphone-15-pro-max", label: "iPhone 15 Pro Max", keywords: "iphone 15 pro max", price_min: 520, price_max: 1000 },
  // --- Génération 16 ---
  { slug: "iphone-16", label: "iPhone 16", keywords: "iphone 16", price_min: 450, price_max: 900 },
  { slug: "iphone-16-plus", label: "iPhone 16 Plus", keywords: "iphone 16 plus", price_min: 500, price_max: 950 },
  { slug: "iphone-16-pro", label: "iPhone 16 Pro", keywords: "iphone 16 pro", price_min: 600, price_max: 1150 },
  { slug: "iphone-16-pro-max", label: "iPhone 16 Pro Max", keywords: "iphone 16 pro max", price_min: 700, price_max: 1300 },
  { slug: "iphone-16e", label: "iPhone 16e", keywords: "iphone 16e", price_min: 300, price_max: 650 },
  // --- Génération 17 (2025) ---
  { slug: "iphone-17", label: "iPhone 17", keywords: "iphone 17", price_min: 600, price_max: 1000 },
  { slug: "iphone-17-air", label: "iPhone 17 Air", keywords: "iphone 17 air", price_min: 700, price_max: 1200 },
  { slug: "iphone-17-pro", label: "iPhone 17 Pro", keywords: "iphone 17 pro", price_min: 800, price_max: 1400 },
  { slug: "iphone-17-pro-max", label: "iPhone 17 Pro Max", keywords: "iphone 17 pro max", price_min: 900, price_max: 1600 },
];

export const BLACKLIST = ["coque","hs","pour piece","pour pièces","boite vide","boîte vide","chargeur","cable","câble","housse","etui","étui","icloud","ecran cassé","écran cassé","vitre arrière"];

// Plan des catégories Discord (pour ne pas avoir 50 salons en vrac)
export const CATEGORIES = [
  { name: "📌・INFO", channels: [
    { slug: "règles", label: "Règles" },
    { slug: "annonces", label: "Annonces" },
    { slug: "comment-chercher", label: "Comment chercher" },
  ]},
  { name: "🔥・AFFAIRES", channels: [
    { slug: "bon-plans-global", label: "Bon plans global" },
    { slug: "pépites-moins-200", label: "Pépites -200€" },
  ]},
  { name: "📱・VINTAGE 2G → X", slugs: ["iphone-2g","iphone-3g","iphone-3gs","iphone-4","iphone-4s","iphone-5","iphone-5c","iphone-5s","iphone-6","iphone-6-plus","iphone-6s","iphone-6s-plus","iphone-se-2016","iphone-7","iphone-7-plus","iphone-8","iphone-8-plus","iphone-x","iphone-xr","iphone-xs","iphone-xs-max"] },
  { name: "📱・iPHONE 11 → 13", slugs: ["iphone-11","iphone-11-pro","iphone-11-pro-max","iphone-se-2020","iphone-12-mini","iphone-12","iphone-12-pro","iphone-12-pro-max","iphone-13-mini","iphone-13","iphone-13-pro","iphone-13-pro-max","iphone-se-2022"] },
  { name: "📱・iPHONE 14 → 15", slugs: ["iphone-14","iphone-14-plus","iphone-14-pro","iphone-14-pro-max","iphone-15","iphone-15-plus","iphone-15-pro","iphone-15-pro-max"] },
  { name: "📱・iPHONE 16 → 17", slugs: ["iphone-16","iphone-16-plus","iphone-16-pro","iphone-16-pro-max","iphone-16e","iphone-17","iphone-17-air","iphone-17-pro","iphone-17-pro-max"] },
  { name: "🤝・COMMUNAUTÉ", channels: [
    { slug: "discussion", label: "Discussion" },
    { slug: "estimation-prix", label: "Estimation prix" },
    { slug: "arnaques-à-éviter", label: "Arnaques à éviter" },
  ]},
];
