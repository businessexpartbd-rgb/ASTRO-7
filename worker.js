/** Serve Astro assets — always fresh HTML + theme CSS/JS after deploy */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const path = url.pathname;
    const headers = new Headers(response.headers);

    const isHashedAstro = path.startsWith('/_astro/');
    const isStaticMedia = /\.(png|jpg|jpeg|webp|svg|woff2?|ico|gif|map)$/i.test(path);
    const isFreshAlways =
      path === '/' ||
      path.endsWith('.html') ||
      path.endsWith('.css') ||
      path.endsWith('.js') ||
      path.endsWith('.json') ||
      path.endsWith('.xml') ||
      path.endsWith('.txt') ||
      !path.includes('.') ||
      path.startsWith('/services/') ||
      path.startsWith('/about') ||
      path.startsWith('/contact');

    if (isHashedAstro) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isStaticMedia) {
      headers.set('Cache-Control', 'public, max-age=86400, must-revalidate');
    } else if (isFreshAlways) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      headers.set('CDN-Cache-Control', 'no-store');
      headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
      headers.set('Surrogate-Control', 'no-store');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      headers.set('Vary', 'Accept-Encoding');
    } else {
      headers.set('Cache-Control', 'no-cache, must-revalidate, max-age=0');
      headers.set('CDN-Cache-Control', 'no-store');
    }

    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('X-Creavix-Cache', 'fresh');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
