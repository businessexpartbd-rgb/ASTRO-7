import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const requiredFiles = [
  'src/pages/index.astro',
  'src/pages/about.astro',
  'src/pages/contact.astro',
  'src/pages/portfolio.astro',
  'src/pages/services/index.astro',
  'src/layouts/Layout.astro',
  'worker.js',
  'wrangler.jsonc',
];
const removedNewsPaths = [
  'src/components/NewsCard.astro',
  'src/data/districts.ts',
  'src/data/news.ts',
  'src/pages/archive.astro',
  'src/pages/districts.astro',
  'src/pages/news',
  'src/pages/search.astro',
  'src/pages/weather.astro',
];
const searchableExtensions = new Set(['.astro', '.css', '.html', '.js', '.json', '.jsonc', '.md', '.mjs', '.scss', '.ts', '.txt', '.xml']);
const forbiddenBrand = /dainik[\s-]*(?:news|bangladesh)|daily[\s-]*news[\s-]*bangladesh|দৈনিক\s*(?:নিউজ|নিউজ বাংলাদেশ)/iu;

const failures = [];
for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) failures.push(`Missing Creavix file: ${file}`);
}
for (const file of removedNewsPaths) {
  if (existsSync(join(root, file))) failures.push(`Removed news path returned: ${file}`);
}

function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) inspect(path);
    else if (searchableExtensions.has(extname(entry.name))) {
      const content = readFileSync(path, 'utf8');
      if (forbiddenBrand.test(content)) failures.push(`News branding remains in ${relative(root, path)}`);
    }
  }
}

for (const directory of ['src', 'public']) inspect(join(root, directory));

const astroConfig = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
if (!astroConfig.includes("site: 'https://www.creavixit.com'")) failures.push('Creavix canonical domain is not fixed.');
if (!astroConfig.includes("output: 'static'")) failures.push('Astro is not configured for static Cloudflare assets.');

const wranglerConfig = readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
if (!wranglerConfig.includes('"name": "creavix"')) failures.push('Cloudflare Worker name is not Creavix.');
if (!wranglerConfig.includes('"directory": "./dist"')) failures.push('Cloudflare asset directory is not dist.');
if (!wranglerConfig.includes('"binding": "DB"')) failures.push('Cloudflare D1 binding is missing.');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log('PASS: Creavix identity, required pages, Cloudflare configuration and Dainik News removal are intact.');
