import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const failures = [];
const htmlFiles = (await filesUnder(dist.pathname)).filter((file) => file.endsWith('.html'));
let imageCount = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const route = relative(dist.pathname, file);
  const size = (await stat(file)).size;
  if (size > 230_000) failures.push(`${route}: HTML exceeds 230 KB (${size} bytes)`);

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    imageCount += 1;
    const tag = match[0];
    if (!/\bloading=(?:"[^"]+"|'[^']+')/.test(tag)) failures.push(`${route}: image is missing loading policy`);
    if (!/\bdecoding=(?:"[^"]+"|'[^']+')/.test(tag)) failures.push(`${route}: image is missing async decoding policy`);
    if (/\bloading=["']lazy["']/.test(tag) && !/\bfetchpriority=["']low["']/.test(tag)) {
      failures.push(`${route}: lazy image is missing low fetch priority`);
    }
  }

  if (/<iframe\b[^>]*\bsrc=/.test(html)) failures.push(`${route}: third-party iframe loads before user interaction`);
  for (const match of html.matchAll(/<script\b[^>]*\bsrc=[^>]*>/g)) {
    if (!/\b(?:defer|async|type=["']module["'])/.test(match[0])) failures.push(`${route}: blocking external script found`);
  }
}

const staticFiles = await filesUnder(dist.pathname);
const oversizedMedia = [];
for (const file of staticFiles) {
  if (!['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'].includes(extname(file).toLowerCase())) continue;
  const size = (await stat(file)).size;
  if (size > 450_000) oversizedMedia.push(`${relative(dist.pathname, file)} (${size} bytes)`);
}
if (oversizedMedia.length) failures.push(`Oversized media: ${oversizedMedia.join(', ')}`);

const perfJs = await readFile(new URL('../public/js/perf.js', import.meta.url), 'utf8');
const perfCss = await readFile(new URL('../public/perf.css', import.meta.url), 'utf8');
const worker = await readFile(new URL('../worker.js', import.meta.url), 'utf8');
if (!perfJs.includes('saveData') || !perfJs.includes('pauseOffscreenMotion')) failures.push('Global runtime performance safeguards are missing');
if (!perfCss.includes('content-visibility: auto') || !perfCss.includes('animation-play-state: paused')) failures.push('Global rendering performance safeguards are missing');
if (!worker.includes('stale-while-revalidate') || !worker.includes('mp4|webm')) failures.push('Cloudflare media cache safeguards are missing');

if (htmlFiles.length < 24) failures.push(`Expected at least 24 generated pages, found ${htmlFiles.length}`);
if (imageCount < 1) failures.push('No generated images were inspected');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`PASS: ${htmlFiles.length} pages and ${imageCount} image instances have loading/decoding priorities.`);
console.log('PASS: third-party video embeds remain click-to-load.');
console.log('PASS: HTML/media budgets, off-screen motion pausing and Cloudflare caching are enforced.');
