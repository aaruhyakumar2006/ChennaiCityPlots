/**
 * Sitemap generator — run with: node scripts/generate-sitemap.mjs
 * Or automatically via: npm run sitemap
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env
 * Outputs public/sitemap.xml
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Parse .env manually (no dotenv dependency needed) ──────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env not found at", envPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "");
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL      = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const SITE_URL          = env.VITE_SITE_URL ?? "https://chennaicityplots.com";

if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR_PROJECT_ID")) {
  console.error("❌  Set VITE_SUPABASE_URL in .env before generating sitemap.");
  process.exit(1);
}

// ── Static routes ───────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { url: "/",          changefreq: "weekly",  priority: "1.0" },
  { url: "/properties", changefreq: "daily",  priority: "0.9" },
  { url: "/saved",      changefreq: "never",  priority: "0.3" },
  { url: "/compare",    changefreq: "never",  priority: "0.3" },
];

// ── Fetch property slugs from Supabase ─────────────────────────────────────
async function fetchSlugs() {
  const url = `${SUPABASE_URL}/rest/v1/properties?select=slug,updated_at&apikey=${SUPABASE_ANON_KEY}`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase API error: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

// ── Fetch distinct locations ────────────────────────────────────────────────
async function fetchLocations() {
  const url = `${SUPABASE_URL}/rest/v1/properties?select=location&apikey=${SUPABASE_ANON_KEY}`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const unique = [...new Set(data.map((r) => r.location).filter(Boolean))];
  return unique;
}

function slugifyLocation(loc) {
  return loc.toLowerCase().trim().replace(/[\s,]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Build XML ───────────────────────────────────────────────────────────────
function buildSitemap(properties, locations) {
  const today = new Date().toISOString().split("T")[0];

  const staticEntries = STATIC_ROUTES.map(
    (r) => `
  <url>
    <loc>${SITE_URL}${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join("");

  const propertyEntries = properties.map(
    (p) => `
  <url>
    <loc>${SITE_URL}/properties/${p.slug}</loc>
    <lastmod>${p.updated_at ? p.updated_at.split("T")[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join("");

  const localityEntries = locations.map(
    (loc) => `
  <url>
    <loc>${SITE_URL}/properties/location/${slugifyLocation(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${propertyEntries}
${localityEntries}
</urlset>`;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🗺️  Generating sitemap…");
  console.log(`   Supabase: ${SUPABASE_URL}`);
  console.log(`   Site URL: ${SITE_URL}`);

  try {
    const [properties, locations] = await Promise.all([fetchSlugs(), fetchLocations()]);
    console.log(`   Found ${properties.length} properties, ${locations.length} localities`);

    const xml = buildSitemap(properties, locations);
    const outPath = path.resolve(__dirname, "../public/sitemap.xml");
    fs.writeFileSync(outPath, xml, "utf-8");
    console.log(`✅  sitemap.xml written to ${outPath}`);
    console.log(`   ${STATIC_ROUTES.length} static + ${properties.length} property + ${locations.length} locality URLs`);
  } catch (err) {
    console.error("❌  Sitemap generation failed:", err.message);
    process.exit(1);
  }
}

main();

