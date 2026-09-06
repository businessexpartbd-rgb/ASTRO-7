const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

const SEED_REVIEWS = [
  { id: 'seed_1', name: 'Rafiul Islam', stars: 5, text: 'Creavix delivered our brand film in 48 hours. Cinematic quality and clear communication throughout.', createdAt: '2026-06-12T10:00:00.000Z', service: 'Video Marketing' },
  { id: 'seed_2', name: 'Nusrat Jahan', stars: 5, text: 'AI প্রোডাক্ট ভিডিওগুলো দেখে ক্লায়েন্টরা রিয়েল মনে করেছে। Meta অ্যাডে কনভার্সন বেড়েছে।', createdAt: '2026-05-28T14:20:00.000Z', service: 'AI Video' },
  { id: 'seed_3', name: 'Karim Hassan', stars: 5, text: 'They rebuilt our company website — fast, mobile-perfect and SEO-ready.', createdAt: '2026-04-03T09:15:00.000Z', service: 'Web Development' },
  { id: 'seed_4', name: 'Sadia Rahman', stars: 4, text: 'Facebook page setup ও boosting campaign—দুটির reporting খুব পরিষ্কার ছিল।', createdAt: '2026-03-18T16:40:00.000Z', service: 'Digital Marketing' },
  { id: 'seed_5', name: 'Tanvir Ahmed', stars: 5, text: 'Application UI and authentication flow were clean, fast and secure.', createdAt: '2026-02-09T11:05:00.000Z', service: 'App Development' },
];

const REVIEW_SERVICES = new Set([
  'Professional Video Editing', 'AI Video Marketing', 'Human-like Content',
  'Web Development', 'App Development', 'Authentication Systems',
  'Business Automation', 'Digital Marketing', 'SEO', 'Facebook Page Services',
  'Facebook Boosting', 'Meta & YouTube Campaigns', 'Other Service',
]);
const CONTACT_BUDGETS = new Set(['Need a recommendation', 'Focused starter scope', 'Growth project scope', 'Long-term partnership']);
const CONTACT_TIMELINES = new Set(['As soon as practical', 'Within 1–2 weeks', 'Within 1 month', 'Planning ahead']);

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com; img-src 'self' data: blob: https:; font-src 'self' data: https://www.gstatic.com; connect-src 'self' https://challenges.cloudflare.com https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com https://www.youtube.com https://www.youtube-nocookie.com; frame-src https://challenges.cloudflare.com https://translate.google.com https://translate.googleapis.com https://www.youtube.com https://www.youtube-nocookie.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'self'; upgrade-insecure-requests",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function ensureReviewsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT,
    picture TEXT,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    body TEXT NOT NULL,
    service TEXT NOT NULL DEFAULT 'Creavix Service',
    visitor_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
    created_at TEXT NOT NULL
  )`).run();
  const upgrades = [
    "ALTER TABLE reviews ADD COLUMN service TEXT NOT NULL DEFAULT 'Creavix Service'",
    "ALTER TABLE reviews ADD COLUMN visitor_hash TEXT NOT NULL DEFAULT 'legacy'",
    "ALTER TABLE reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'",
  ];
  for (const sql of upgrades) {
    try { await db.prepare(sql).run(); } catch {}
  }
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_reviews_visitor_created ON reviews(visitor_hash, created_at DESC)').run();
}

async function hashVisitor(request, visitorId, secret) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';
  const input = `${secret || 'creavix-review-v1'}|${ip}|${ua}|${visitorId || ''}`;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyTurnstile(request, token, env) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  form.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  return result.ok && Boolean((await result.json()).success);
}

async function listReviews(env) {
  if (!env.DB) return { reviews: SEED_REVIEWS, storage: 'seed' };
  await ensureReviewsTable(env.DB);
  const { results } = await env.DB.prepare(`SELECT id, name, stars, body AS text, service, created_at AS createdAt
    FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 500`).all();
  return { reviews: [...(results || []), ...SEED_REVIEWS], storage: 'd1' };
}

async function reviewsApi(request, env) {
  if (request.method === 'GET') return json({ ok: true, ...(await listReviews(env)) });
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
  if (!env.DB) return json({ ok: false, error: 'Reviews database is not connected yet.' }, 503);

  let input;
  try { input = await request.json(); } catch { return json({ ok: false, error: 'Invalid request' }, 400); }
  if (String(input.company || '').trim()) return json({ ok: true });
  const name = String(input.name || '').trim().replace(/\s+/g, ' ') || 'Guest Client';
  const text = String(input.text || '').trim().replace(/\s+/g, ' ');
  const service = String(input.service || 'Creavix Service').trim().replace(/\s+/g, ' ');
  const stars = Number.parseInt(input.stars, 10);
  if (name.length < 2 || name.length > 60) return json({ ok: false, error: 'Name must be 2–60 characters.' }, 400);
  if (text.length < 10 || text.length > 600) return json({ ok: false, error: 'Review must be 10–600 characters.' }, 400);
  if (!REVIEW_SERVICES.has(service) || !Number.isInteger(stars) || stars < 1 || stars > 5) return json({ ok: false, error: 'Invalid review.' }, 400);
  if (!(await verifyTurnstile(request, input.turnstileToken, env))) return json({ ok: false, error: 'Human verification failed.' }, 403);

  await ensureReviewsTable(env.DB);
  const visitorHash = await hashVisitor(request, String(input.visitorId || '').slice(0, 100), env.REVIEW_HASH_SECRET);
  const recent = await env.DB.prepare(`SELECT COUNT(*) AS count FROM reviews
    WHERE visitor_hash = ? AND created_at >= datetime('now', '-1 hour')`).bind(visitorHash).first();
  if (Number(recent?.count || 0) >= 2) return json({ ok: false, error: 'Please wait before posting another review.' }, 429);
  const duplicate = await env.DB.prepare(`SELECT COUNT(*) AS count FROM reviews
    WHERE visitor_hash = ? AND lower(body) = lower(?)`).bind(visitorHash, text).first();
  if (Number(duplicate?.count || 0) > 0) return json({ ok: false, error: 'This review was already submitted.' }, 409);

  const review = { id: crypto.randomUUID(), name, stars, text, service: service || 'Creavix Service', createdAt: new Date().toISOString() };
  await env.DB.prepare(`INSERT INTO reviews (id, user_id, name, email, picture, stars, body, service, visitor_hash, status, created_at)
    VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, 'pending', ?)`).bind(review.id, visitorHash + ':' + review.id, review.name, review.stars, review.text, review.service, visitorHash, review.createdAt).run();
  return json({ ok: true, storage: 'd1', status: 'pending' }, 202);
}

async function ensureLeadsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    budget TEXT NOT NULL,
    timeline TEXT NOT NULL,
    goal TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed','spam')),
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_leads_visitor_created ON leads(visitor_hash, created_at DESC)').run();
}

async function contactApi(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
  if (!env.DB) return json({ ok: false, error: 'Secure project storage is not connected.' }, 503);
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) return json({ ok: false, error: 'Request origin rejected.' }, 403);

  let input;
  try { input = await request.json(); } catch { return json({ ok: false, error: 'Invalid request' }, 400); }
  if (String(input.company || '').trim()) return json({ ok: true, status: 'received' }, 201);
  const clean = (value) => String(value || '').trim().replace(/\s+/g, ' ');
  const name = clean(input.name);
  const phone = clean(input.phone);
  const service = clean(input.service);
  const budget = clean(input.budget);
  const timeline = clean(input.timeline);
  const goal = clean(input.goal);
  if (name.length < 2 || name.length > 60) return json({ ok: false, error: 'Name must be 2–60 characters.' }, 400);
  if (phone.length < 6 || phone.length > 25 || !/^[+()\d\s.-]+$/.test(phone)) return json({ ok: false, error: 'Enter a valid phone or WhatsApp number.' }, 400);
  if (!REVIEW_SERVICES.has(service) || !CONTACT_BUDGETS.has(budget) || !CONTACT_TIMELINES.has(timeline)) return json({ ok: false, error: 'Choose a valid project option.' }, 400);
  if (goal.length < 10 || goal.length > 1000) return json({ ok: false, error: 'Project goal must be 10–1000 characters.' }, 400);

  await ensureLeadsTable(env.DB);
  const visitorHash = await hashVisitor(request, '', env.REVIEW_HASH_SECRET);
  const recent = await env.DB.prepare(`SELECT COUNT(*) AS count FROM leads
    WHERE visitor_hash = ? AND created_at >= datetime('now', '-1 hour')`).bind(visitorHash).first();
  if (Number(recent?.count || 0) >= 2) return json({ ok: false, error: 'Please wait before sending another project brief.' }, 429);
  await env.DB.prepare(`INSERT INTO leads (id, name, phone, service, budget, timeline, goal, visitor_hash, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`).bind(crypto.randomUUID(), name, phone, service, budget, timeline, goal, visitorHash, new Date().toISOString()).run();
  return json({ ok: true, storage: 'd1', status: 'received' }, 201);
}

/** Cloudflare Worker: review API plus optimized Astro static assets. */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/reviews') {
      try { return await reviewsApi(request, env); }
      catch (error) { return json({ ok: false, error: 'Unable to process reviews.', detail: String(error?.message || '') }, 500); }
    }
    if (url.pathname === '/api/contact') {
      try { return await contactApi(request, env); }
      catch (error) { return json({ ok: false, error: 'Unable to save the project brief.', detail: String(error?.message || '') }, 500); }
    }
    const response = await env.ASSETS.fetch(request);
    const path = url.pathname;
    const headers = new Headers(response.headers);
    const isHashedAstro = path.startsWith('/_astro/');
    const isVersionedCode = /\.(css|js)$/i.test(path) && url.searchParams.has('v');
    const isStaticMedia = /\.(png|jpg|jpeg|webp|avif|svg|woff2?|ico|gif|mp4|webm|mov|m4v|mp3|ogg|wav)$/i.test(path);
    const isDocument = path === '/' || path.endsWith('.html') || !path.includes('.');
    if (isHashedAstro || isVersionedCode) headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    else if (isStaticMedia) headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');
    else if (isDocument) {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      headers.set('CDN-Cache-Control', 'public, max-age=600, stale-while-revalidate=86400');
    } else if (path.endsWith('.xml') || path.endsWith('.txt')) {
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      headers.set('CDN-Cache-Control', 'public, max-age=3600');
    } else if (path.endsWith('.json')) headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
    else headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
    headers.set('X-Creavix-Cache', 'optimized');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
