import { news } from '../data/news';

export function GET({ site }: { site: URL }) {
  const origin = site ?? new URL('http://localhost:4321');
  const staticPaths = ['/', '/archive/', '/districts/', '/search/', '/weather/', '/about/', '/editorial-policy/', '/contact/', '/privacy/'];
  const urls = [...staticPaths.map(path => ({ path, lastmod: new Date().toISOString() })), ...news.map(item => ({ path: `/news/${item.slug}/`, lastmod: item.updatedAt }))];
  const body = urls.map(item => `<url><loc>${new URL(item.path, origin)}</loc><lastmod>${new Date(item.lastmod).toISOString()}</lastmod></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
