import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}

walk(dist);

const failures = [];
const titles = new Map();
const h1s = new Map();
const profiles = new Set();

const routeFor = (file) => {
  const rel = path.relative(dist, file).replaceAll(path.sep, '/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\/index\.html$/, '')}`;
};

const text = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = routeFor(file);
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || '';
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
  const profile = html.match(/data-page-profile="([^"]+)"/i)?.[1] || '';
  const kind = html.match(/data-page-kind="([^"]+)"/i)?.[1] || '';
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => text(match[1]));

  if (!title) failures.push(`${route}: missing title`);
  if (description.length < 70 || description.length > 166) failures.push(`${route}: meta description length ${description.length}`);
  if (!canonical) failures.push(`${route}: missing canonical`);
  if (h1Matches.length !== 1) failures.push(`${route}: expected one H1, found ${h1Matches.length}`);
  if (!profile || !kind) failures.push(`${route}: missing visual profile`);
  if (!html.includes('BreadcrumbList')) failures.push(`${route}: missing breadcrumb schema`);
  if (!html.includes('id="main-content"')) failures.push(`${route}: missing main-content target`);
  if (route.startsWith('/services/') && !html.includes('"@type":"Service"')) failures.push(`${route}: missing Service schema`);
  if (route.startsWith('/services/') && !html.includes('href="/services')) failures.push(`${route}: missing service navigation link`);

  profiles.add(profile);
  if (titles.has(title)) failures.push(`${route}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, route);
  if (h1Matches[0]) {
    if (h1s.has(h1Matches[0])) failures.push(`${route}: duplicate H1 with ${h1s.get(h1Matches[0])}`);
    else h1s.set(h1Matches[0], route);
  }
}

const cssDir = path.join(dist, '_astro');
const css = fs.readdirSync(cssDir)
  .filter((file) => file.endsWith('.css'))
  .map((file) => fs.readFileSync(path.join(cssDir, file), 'utf8'))
  .join('\n');
if (!css.includes('prefers-reduced-motion')) failures.push('CSS: missing reduced-motion support');
if (!css.includes('data-page-kind')) failures.push('CSS: missing route-aware page system');
if (!/(max-width:\s*767px|width<=767px)/.test(css)) failures.push('CSS: missing mobile quality breakpoint');

if (htmlFiles.length !== 24) failures.push(`expected 24 generated routes, found ${htmlFiles.length}`);
if (profiles.size < 18) failures.push(`expected at least 18 visual profiles, found ${profiles.size}`);

if (failures.length) {
  console.error(`Route quality verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS: ${htmlFiles.length} routes, ${profiles.size} visual profiles, unique titles/H1s, metadata, schema, mobile and reduced-motion safeguards.`);
