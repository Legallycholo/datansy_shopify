#!/usr/bin/env node
/**
 * Scan theme JSON/Liquid for internal links and compare to live store collections/pages/blogs.
 * Usage: node scripts/audit-links.mjs [store-url]
 * Example: node scripts/audit-links.mjs https://datansy.com
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const store = (process.argv[2] || 'https://datansy.com').replace(/\/$/, '');

const ALLOWED_COLLECTIONS = new Set(['all', 'vendors']);
const LINK_RE = /["'](\/(?:collections|pages|blogs)\/[a-z0-9\-_/]+)["']/gi;

function walk(dir, ext, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      walk(full, ext, out);
    } else if (full.endsWith(ext)) out.push(full);
  }
  return out;
}

function collectLinks() {
  const files = [
    ...walk(path.join(root, 'sections'), '.json'),
    ...walk(path.join(root, 'sections'), '.liquid'),
    ...walk(path.join(root, 'templates'), '.json'),
    ...walk(path.join(root, 'config'), '.json'),
  ];
  const links = new Map();
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = LINK_RE.exec(text)) !== null) {
      const url = m[1].split('?')[0];
      if (!links.has(url)) links.set(url, new Set());
      links.get(url).add(path.relative(root, file));
    }
  }
  return links;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  const [collectionsData, pagesData, blogsData] = await Promise.all([
    fetchJson(`${store}/collections.json?limit=250`),
    fetchJson(`${store}/pages.json?limit=250`),
    fetchJson(`${store}/blogs.json?limit=50`),
  ]);

  const liveCollections = new Map(
    (collectionsData?.collections || []).map((c) => [c.handle, c.products_count ?? 0])
  );
  const livePages = new Set((pagesData?.pages || []).map((p) => p.handle));
  const liveBlogs = new Set((blogsData?.blogs || []).map((b) => b.handle));

  const links = collectLinks();
  let missingIssues = 0;
  let emptyIssues = 0;

  console.log(`Datansy link audit — ${store}\n`);
  console.log(`Live collections: ${[...liveCollections.keys()].join(', ') || '(none)'}`);
  console.log(`Live pages: ${[...livePages].join(', ') || '(none)'}`);
  console.log(`Live blogs: ${[...liveBlogs].join(', ') || '(none)'}\n`);

  for (const [url, sources] of [...links.entries()].sort()) {
    const [, kind, handle] = url.match(/^\/(collections|pages|blogs)\/([^/?]+)/) || [];
    if (!kind) continue;

    let ok = false;
    if (kind === 'collections') {
      ok = ALLOWED_COLLECTIONS.has(handle) || liveCollections.has(handle);
      if (ok && liveCollections.has(handle) && liveCollections.get(handle) === 0) {
        emptyIssues += 1;
        console.warn(`EMPTY COLLECTION ${url} (0 products)`);
        for (const src of sources) console.warn(`  → ${src}`);
      }
    } else if (kind === 'pages') {
      ok = livePages.has(handle);
    } else if (kind === 'blogs') {
      ok = liveBlogs.has(handle);
    }

    if (!ok) {
      missingIssues += 1;
      console.warn(`MISSING ${url}`);
      for (const src of sources) console.warn(`  → ${src}`);
    }
  }

  const pagesRes = await fetch(`${store}/pages/contact-us`);
  if (pagesRes.ok) {
    const html = await pagesRes.text();
    if (html.match(/gsmpro|GSMPRO/i)) {
      console.warn('\nBRAND MISMATCH: contact-us page still references GSMPRO (update in Shopify Admin)');
    }
  }

  if (missingIssues === 0 && emptyIssues === 0) {
    console.log('\nOK: All scanned links resolve and linked collections have products.');
  } else {
    console.log(`\n${missingIssues} missing link(s), ${emptyIssues} empty collection link(s).`);
    if (missingIssues > 0) process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
