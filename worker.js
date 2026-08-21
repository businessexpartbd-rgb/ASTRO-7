/** Serve Astro assets with browser-safe revalidation and Cloudflare edge caching. */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const path = url.pathname;
    const headers = new Headers(response.headers);

    const isHashedAstro = path.startsWith('/_astro/');
    const isVersionedCode = /\.(css|js)$/i.test(path) && url.searchParams.has('v');
    const isStaticMedia = /\.(png|jpg|jpeg|webp|avif|svg|woff2?|ico|gif)$/i.test(path);
    const isDocument =
      path === '/' ||
      path.endsWith('.html') ||
      !path.includes('.');

    if (isHashedAstro || isVersionedCode) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isStaticMedia) {
      headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    } else if (isDocument) {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      headers.set('CDN-Cache-Control', 'public, max-age=600, stale-while-revalidate=86400');
    } else if (path.endsWith('.xml') || path.endsWith('.txt')) {
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      headers.set('CDN-Cache-Control', 'public, max-age=3600');
    } else if (path.endsWith('.json')) {
      headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
    } else {
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'interest-cohort=()');
    headers.set('X-Creavix-Cache', 'optimized');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
