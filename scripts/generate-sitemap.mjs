import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const outputDirectory = new URL('../dist/', import.meta.url);
const site = new URL(process.env.SITE_URL || 'https://www.creavixit.com');

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtml(path));
    else if (entry.isFile() && entry.name === 'index.html') files.push(path);
  }

  return files;
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const rootPath = outputDirectory.pathname;
const routes = (await collectHtml(rootPath))
  .map((file) => {
    const directory = relative(rootPath, file)
      .split(sep)
      .slice(0, -1)
      .join('/');
    return directory ? `/${directory}` : '/';
  })
  .sort((a, b) => a.localeCompare(b));

const urls = routes
  .map((route) => `  <url><loc>${escapeXml(new URL(route, site).href)}</loc></url>`)
  .join('\n');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
  '',
].join('\n');

await writeFile(new URL('sitemap.xml', outputDirectory), sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${routes.length} routes`);
