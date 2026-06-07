#!/usr/bin/env node
/**
 * Scan theme JSON/Liquid for internal links and compare to live store collections/pages.
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
  const collectionsData = await fetchJson(`${store}/collections.json?limit=250`);
  const pagesData = await fetchJson(`${store}/pages.json?limit=250`);

  const liveCollections = new Set(
    (collectionsData?.collections || []).map((c) => c.handle)
  );
  const livePages = new Set((pagesData?.pages || []).map((p) => p.handle));

  const links = collectLinks();
  let issues = 0;

  console.log(`Datansy link audit — ${store}\n`);
  console.log(`Live collections: ${[...liveCollections].join(', ') || '(none)'}`);
  console.log(`Live pages: ${[...livePages].join(', ') || '(none)'}\n`);

  for (const [url, sources] of [...links.entries()].sort()) {
    const [, kind, handle] = url.match(/^\/(collections|pages|blogs)\/([^/?]+)/) || [];
    if (!kind) continue;

    let ok = false;
    if (kind === 'collections') {
      ok = ALLOWED_COLLECTIONS.has(handle) || liveCollections.has(handle);
    } else if (kind === 'pages') {
      ok = livePages.has(handle);
    } else if (kind === 'blogs') {
      ok = false;
    }

    if (!ok) {
      issues += 1;
      console.warn(`MISSING ${url}`);
      for (const src of sources) console.warn(`  → ${src}`);
    }
  }

  if (issues === 0) {
    console.log('OK: All scanned internal collection/page links resolve on the live store.');
  } else {
    console.log(`\n${issues} link(s) need Admin content or theme URL updates.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
