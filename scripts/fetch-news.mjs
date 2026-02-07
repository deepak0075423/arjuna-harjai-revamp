/**
 * Fetch "Arjuna Harjai" news via Google News RSS and write to `assets/data/news.json`.
 *
 * Why RSS instead of the google.com search URL?
 * - The web search page is dynamic and not CORS-friendly for front-end fetch.
 * - RSS is a stable feed format and works well for build-time updates.
 *
 * Run:
 *   node scripts/fetch-news.mjs
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const OUT_PATH = resolve(repoRoot, 'assets/data/news.json');

// Google News RSS endpoint for a query (adjust locale if needed).
const RSS_URL =
  'https://news.google.com/rss/search?q=' +
  encodeURIComponent('Arjuna Harjai') +
  '&hl=en-GB&gl=GB&ceid=GB:en';

const MAX_ITEMS = 30;
const ARTICLE_IMAGE_LOOKUP_LIMIT = 20;
const FETCH_TIMEOUT_MS = 10_000;

function decodeCdata(text) {
  if (!text) return '';
  return text.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function pickFirst(match) {
  return match && match[1] ? match[1].trim() : '';
}

function extractTag(itemXml, tagName) {
  // Handles <tag>value</tag> and <tag><![CDATA[value]]></tag>
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const m = itemXml.match(re);
  return decodeCdata(pickFirst(m));
}

function extractAttr(itemXml, tagName, attrName) {
  const re = new RegExp(`<${tagName}[^>]*\\b${attrName}=\"([^\"]+)\"[^>]*>`, 'i');
  const m = itemXml.match(re);
  return pickFirst(m);
}

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractFromSrcset(srcset) {
  if (!srcset) return '';
  // srcset: "url1 320w, url2 640w" -> take first URL
  const first = String(srcset).split(',')[0]?.trim() || '';
  const url = first.split(/\s+/)[0]?.trim() || '';
  return url;
}

function extractAttrFromTag(tag, attrName) {
  if (!tag) return '';
  const re = new RegExp(`\\b${attrName}\\s*=\\s*["']([^"']+)["']`, 'i');
  const m = String(tag).match(re);
  return decodeHtmlEntities(pickFirst(m));
}

function isUsableUrl(url) {
  if (!url) return false;
  const u = String(url).trim();
  if (!u) return false;
  if (u.startsWith('data:')) return false;
  if (u.startsWith('about:')) return false;
  return true;
}

function extractFirstImgUrl(html) {
  if (!html) return '';

  const imgTags = String(html).match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgTags) {
    const dataSrc =
      extractAttrFromTag(tag, 'data-src') ||
      extractAttrFromTag(tag, 'data-lazy-src') ||
      extractAttrFromTag(tag, 'data-original') ||
      extractAttrFromTag(tag, 'data-actualsrc');

    if (isUsableUrl(dataSrc)) return dataSrc;

    const dataSrcset = extractAttrFromTag(tag, 'data-srcset');
    const fromDataSrcset = extractFromSrcset(dataSrcset);
    if (isUsableUrl(fromDataSrcset)) return fromDataSrcset;

    const srcset = extractAttrFromTag(tag, 'srcset');
    const fromSrcset = extractFromSrcset(srcset);
    if (isUsableUrl(fromSrcset)) return fromSrcset;

    const src = extractAttrFromTag(tag, 'src');
    if (isUsableUrl(src)) return src;
  }

  return '';
}

function extractMetaContent(html, attrName, attrValue) {
  if (!html) return '';
  const re = new RegExp(
    `<meta[^>]+${attrName}=["']${attrValue}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  const m = String(html).match(re);
  return decodeHtmlEntities(pickFirst(m));
}

function toAbsoluteUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return '';
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function findArticleImage(articleUrl) {
  if (!articleUrl) return null;

  try {
    const res = await fetchWithTimeout(articleUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; static-site-news-fetch/1.0)',
        accept: 'text/html,application/xhtml+xml'
      },
      redirect: 'follow'
    });

    if (!res.ok) return null;
    const html = await res.text();

    const ogImage =
      extractMetaContent(html, 'property', 'og:image') ||
      extractMetaContent(html, 'name', 'og:image') ||
      extractMetaContent(html, 'name', 'twitter:image') ||
      extractMetaContent(html, 'property', 'twitter:image');

    const imgFromMeta = ogImage ? toAbsoluteUrl(ogImage, res.url || articleUrl) : '';
    if (imgFromMeta) return imgFromMeta;

    const firstImg = extractFirstImgUrl(html);
    const imgFromBody = firstImg ? toAbsoluteUrl(firstImg, res.url || articleUrl) : '';
    if (imgFromBody) return imgFromBody;

    return null;
  } catch {
    return null;
  }
}

function parseRss(xml) {
  const items = xml.split(/<item>/i).slice(1).map((chunk) => chunk.split(/<\/item>/i)[0]);
  const parsed = [];

  for (const itemXml of items) {
    const title = extractTag(itemXml, 'title');
    const url = extractTag(itemXml, 'link');
    const pubDateRaw = extractTag(itemXml, 'pubDate');
    const source = extractTag(itemXml, 'source');
    const description = extractTag(itemXml, 'description');
    const contentEncoded = extractTag(itemXml, 'content:encoded');

    const mediaThumb =
      extractAttr(itemXml, 'media:thumbnail', 'url') ||
      extractAttr(itemXml, 'media:content', 'url') ||
      extractAttr(itemXml, 'enclosure', 'url');

    const image =
      mediaThumb ||
      extractFirstImgUrl(description) ||
      extractFirstImgUrl(contentEncoded) ||
      null;

    const date = pubDateRaw ? new Date(pubDateRaw).toISOString() : null;

    if (!title || !url) continue;

    parsed.push({
      title,
      url,
      source: source || null,
      date,
      image
    });

    if (parsed.length >= MAX_ITEMS) break;
  }

  return parsed;
}

async function enrichImages(items) {
  const candidates = items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => !item.image && item.url)
    .slice(0, ARTICLE_IMAGE_LOOKUP_LIMIT);

  for (const { item } of candidates) {
    const img = await findArticleImage(item.url);
    if (img) item.image = img;
  }
}

async function main() {
  const res = await fetch(RSS_URL, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; static-site-news-fetch/1.0)'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch RSS (${res.status})`);
  }

  const xml = await res.text();
  const items = parseRss(xml);
  await enrichImages(items);

  await mkdir(resolve(repoRoot, 'assets/data'), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2), 'utf8');

  console.log(`Wrote ${items.length} items -> assets/data/news.json`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
