// Moteur navigateur (Puppeteer + Chrome réel).
// Vinted et Leboncoin bloquent les appels API directs (Cloudflare / Datadome)
// mais laissent passer un vrai Chrome sur une IP résidentielle.

import puppeteer from "puppeteer-core";
import path from "node:path";

const CHROME_PATH = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

let browser = null;
let browserMode = "";
let launchPromise = null;

export async function getBrowser(headful = false) {
  const mode = headful ? "headful" : "headless";
  if (browser?.connected && browserMode === mode) return browser;
  if (browser?.connected) await closeBrowser();
  // Verrou : les workers parallèles partagent le même lancement Chrome.
  if (!launchPromise) {
    launchPromise = (async () => {
      browserMode = mode;
      const userDir = path.join(process.env.BOT_DATA_DIR || process.cwd(), "chrome-profil");
      const ephemeral = process.env.EPHEMERAL_CHROME === "1";
      const launchOpts = (dir) => ({
        executablePath: CHROME_PATH,
        headless: headful ? false : "new",
        ...(dir ? { userDataDir: dir } : {}),
        args: [
          "--no-sandbox",
          "--disable-blink-features=AutomationControlled",
          "--window-size=1280,900",
          "--lang=fr-FR",
        ],
      });
      try {
        browser = await puppeteer.launch(launchOpts(ephemeral ? undefined : userDir));
      } catch (e) {
        // Profil verrouillé par un crash (Chrome orphelin) : purge les lockfiles et relance 1 fois
        if (String(e.message || "").includes("already running")) {
          try {
            const fs2 = await import("node:fs");
            for (const f of ["DevToolsActivePort", "lockfile", "SingletonCookie", "SingletonSocket", "SingletonLock"]) {
              try { fs2.rmSync(path.join(userDir, f), { force: true }); } catch {}
              try { fs2.rmSync(path.join(userDir, "Default", f), { force: true }); } catch {}
            }
          } catch {}
          browser = await puppeteer.launch(launchOpts(ephemeral ? undefined : userDir));
        } else throw e;
      }
      return browser;
    })().finally(() => { launchPromise = null; });
  }
  return launchPromise;
}

export async function closeBrowser() {
  try { await browser?.close(); } catch {}
  browser = null;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// Page allégée : on bloque images/polices/vidéos (téléchargements lourds)
// mais les balises <img> restent dans le DOM → on garde les URL photos.
async function fastPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const t = req.resourceType();
    if (t === "image" || t === "media" || t === "font") req.abort().catch(() => {});
    else req.continue().catch(() => {});
  });
  return page;
}

async function dismissCookies(page) {
  // Vinted / LBC : bouton "Tout refuser" variable selon les versions
  const labels = ["Tout refuser", "Tout rejeter", "Refuser", "Continuer sans accepter", "Accepter uniquement les cookies nécessaires"];
  for (const t of labels) {
    try {
      const btn = await page.evaluateHandle((txt) => {
        const els = [...document.querySelectorAll("button")];
        return els.find((b) => b.textContent?.includes(txt)) || null;
      }, t);
      const el = btn.asElement();
      if (el) { await el.click().catch(() => {}); await new Promise((r) => setTimeout(r, 800)); return; }
    } catch {}
  }
}

function parsePrice(text) {
  if (!text) return 0;
  const m = text.replace(/\u00a0/g, " ").match(/(\d[\d\s.,]*)\s*€/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
}

async function extractCards(page, mustInclude) {
  return page.evaluate((needle) => {
    const out = [];
    const seen = new Set();
    const priceRe = /\d[\d\s.,]*\s*€/;
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href") || "";
      if (!href.includes(needle)) continue;
      const url = href.startsWith("http") ? href.split("?")[0] : location.origin + href.split("?")[0];
      if (seen.has(url)) continue;
      seen.add(url);
      // Le texte prix/titre est souvent dans le parent carte, pas dans le <a>
      let text = a.innerText || a.textContent || "";
      let el = a.parentElement;
      let card = a.parentElement;
      for (let i = 0; i < 5 && el; i++) {
        const t = el.innerText || "";
        if (priceRe.test(t) && t.length > text.length) { text = t; card = el; break; }
        el = el.parentElement;
      }
      const img = card?.querySelector?.("img")?.currentSrc || card?.querySelector?.("img")?.src || "";
      out.push({ url, text: (text || "").slice(0, 800), image: img });
    }
    return out;
  }, mustInclude);
}

// ---------- Vinted ----------
export async function scrapeVinted(search) {
  const b = await getBrowser();
  const page = await fastPage(b);
  try {
    await page.setUserAgent(UA);
    const url =
      "https://www.vinted.fr/catalog?search_text=" + encodeURIComponent(search.keywords) +
      "&order=newest_first" +
      (search.price_min ? `&price_from=${search.price_min}` : "") +
      (search.price_max ? `&price_to=${search.price_max}` : "");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1200));
    await dismissCookies(page);
    // Attente intelligente : on part dès que les annonces sont là (pas de sleep fixe).
    await page.waitForSelector('a[href*="/items/"]', { timeout: 12000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1000));
    const cards = await extractCards(page, "/items/");
    // Vinted ajoute des "Articles similaires" / sponsorisés en bas de page
    // (vêtements, accessoires...) : on ne garde que les vrais résultats du haut.
    return cards.slice(0, 60).map((c) => {
      const lines = c.text.split("\n").map((l) => l.trim()).filter(Boolean);
      return {
        source: "vinted",
        keywords: search.keywords,
        id: "vinted-" + (c.url.match(/\/items\/(\d+)/)?.[1] || c.url),
        title: lines.filter((l) => !/€/.test(l)).slice(0, 2).join(" ") || lines[0] || search.keywords,
        price: parsePrice(c.text),
        currency: "EUR",
        url: c.url,
        image: c.image || "",
      };
    }).filter((i) => i.price > 0);
  } finally {
    await page.close().catch(() => {});
  }
}

// Pool : plusieurs modèles scannés en parallèle (2 pages Chrome à la fois).
// Divise le temps d'un cycle par ~2 sans déclencher l'anti-bot.
export async function scrapeVintedPool(searches, concurrency = 2, hooks = {}) {
  let i = 0;
  const items = [], errors = [];
  const worker = async () => {
    while (i < searches.length) {
      const s = searches[i++];
      try { hooks.onStart?.(s); items.push(...await scrapeVinted(s)); }
      catch (e) { errors.push({ keywords: s.keywords, error: String(e.message || e).slice(0, 160) }); }
      finally { hooks.onDone?.(s); }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, searches.length) }, worker));
  return { items, errors };
}

// ---------- Leboncoin (désactivé par défaut : Datadome bloque l'invisible) ----------
// NOTE: Datadome bloque souvent le mode headless (page vide).
// Si 0 résultat, relance avec `node main.js --once --visible`,
// résous le captcha UNE fois dans la fenêtre Chrome : la session
// est sauvegardée dans ./chrome-profil et les scans suivants passent.
export async function scrapeLeboncoin(search, { headful = false } = {}) {
  const b = await getBrowser(headful);
  const page = await b.newPage();
  try {
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
    let price = "";
    if (search.price_min || search.price_max) price = `&price=${search.price_min || "min"}-${search.price_max || "max"}`;
    const url =
      "https://www.leboncoin.fr/recherche?category=9&text=" + encodeURIComponent(search.keywords) +
      price + "&sort=time&order=desc";
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 4000));
    await dismissCookies(page);
    await new Promise((r) => setTimeout(r, 2000));
    const cards = await extractCards(page, "(/annonce/|/ad/|adview)");
    // fallback générique : toute carte avec un prix en €
    const generic = cards.length ? cards : (await page.evaluate(() => {
      const out = [];
      for (const a of document.querySelectorAll("a[href]")) {
        const t = a.innerText || "";
        if (/\d[\d\s.,]*\s*€/.test(t) && t.toLowerCase().includes("iphone")) {
          const href = a.getAttribute("href");
          out.push({ url: href.startsWith("http") ? href : location.origin + href, text: t.slice(0, 500) });
        }
      }
      return out.slice(0, 30);
    }));
    return generic.map((c) => {
      const lines = c.text.split("\n").map((l) => l.trim()).filter(Boolean);
      return {
        source: "leboncoin",
        id: "lbc-" + Buffer.from(c.url).toString("base64").slice(0, 24),
        title: lines.filter((l) => !/€/.test(l)).slice(0, 2).join(" ") || lines[0] || search.keywords,
        price: parsePrice(c.text),
        currency: "EUR",
        url: c.url,
        image: "",
      };
    }).filter((i) => i.price > 0);
  } finally {
    await page.close().catch(() => {});
  }
}
