export function GET({ site }: { site: URL }) {
  const origin = site ?? new URL('http://localhost:4321');
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', origin)}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
