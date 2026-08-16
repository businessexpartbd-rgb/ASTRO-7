/** Serve Astro static assets + force fresh HTML (no stale CDN/browser cache) */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const path = url.pathname;
    const headers = new Headers(response.headers);

    const isAsset =
      path.startsWith('/_astro/') ||
      /\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ico|gif|map)$/i.test(path);

    if (isAsset) {
      // hashed assets can be cached long
      if (path.startsWith('/_astro/')) {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      }
    } else {
      // HTML / routes: never serve stale after deploy
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      headers.set('CDN-Cache-Control', 'no-store');
      headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    }

    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
