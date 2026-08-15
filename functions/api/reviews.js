/**
 * Creavix Reviews API — permanent storage
 *
 * Priority:
 *  1) Cloudflare D1  → binding name: DB
 *  2) GitHub file    → env GITHUB_TOKEN + optional GITHUB_REPO
 *
 * Google: POST body.credential = GIS id_token
 * Optional env: GOOGLE_CLIENT_ID (aud check)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const DEFAULT_REPO = 'businessexpartbd-rgb/ASTRO-7';
const GH_PATH = 'data/reviews-db.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

async function ensureTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        picture TEXT,
        stars INTEGER NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    )
    .run();
  try {
    await db
      .prepare(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)`
      )
      .run();
  } catch (_) {}
}

async function d1List(db) {
  await ensureTable(db);
  const { results } = await db
    .prepare(
      `SELECT id, user_id as userId, name, email, picture, stars,
              body as text, created_at as createdAt
       FROM reviews ORDER BY created_at DESC LIMIT 200`
    )
    .all();
  return results || [];
}

async function d1Upsert(db, review) {
  await ensureTable(db);
  await db
    .prepare(`DELETE FROM reviews WHERE user_id = ?`)
    .bind(review.userId)
    .run();
  await db
    .prepare(
      `INSERT INTO reviews (id, user_id, name, email, picture, stars, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      review.id,
      review.userId,
      review.name,
      review.email,
      review.picture,
      review.stars,
      review.text,
      review.createdAt
    )
    .run();
}

async function ghHeaders(token) {
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Creavix-Reviews-API',
  };
}

async function ghGetStore(token, repo) {
  const url =
    'https://api.github.com/repos/' + repo + '/contents/' + GH_PATH;
  const res = await fetch(url, { headers: await ghHeaders(token) });
  if (res.status === 404) {
    return { reviews: [], sha: null };
  }
  if (!res.ok) throw new Error('GitHub read failed');
  const data = await res.json();
  const text = atob(data.content.replace(/\n/g, ''));
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { reviews: [] };
  }
  return {
    reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    sha: data.sha,
  };
}

async function ghPutStore(token, repo, reviews, sha) {
  const body = JSON.stringify({ reviews: reviews }, null, 2);
  // btoa for UTF-8 safe-ish ASCII content
  const content = btoa(unescape(encodeURIComponent(body)));
  const url =
    'https://api.github.com/repos/' + repo + '/contents/' + GH_PATH;
  const payload = {
    message: 'chore: update reviews database',
    content: content,
    committer: { name: 'Creavix Reviews', email: 'reviews@creavixit.com' },
  };
  if (sha) payload.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...(await ghHeaders(token)),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('GitHub write failed: ' + err);
  }
}

async function verifyGoogleToken(idToken, expectedClientId) {
  const res = await fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' +
      encodeURIComponent(idToken)
  );
  if (!res.ok) return null;
  const payload = await res.json();
  if (payload.error) return null;
  if (expectedClientId && payload.aud !== expectedClientId) return null;
  if (payload.email_verified !== 'true' && payload.email_verified !== true)
    return null;
  return {
    userId: payload.sub,
    name: payload.name || payload.email || 'User',
    email: payload.email || '',
    picture: payload.picture || '',
  };
}

function storageMode(env) {
  if (env.DB) return 'd1';
  if (env.GITHUB_TOKEN) return 'github';
  return 'none';
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(context) {
  try {
    const env = context.env;
    const mode = storageMode(env);

    if (mode === 'd1') {
      const reviews = await d1List(env.DB);
      return json({ ok: true, storage: 'd1', reviews });
    }

    if (mode === 'github') {
      const repo = env.GITHUB_REPO || DEFAULT_REPO;
      const store = await ghGetStore(env.GITHUB_TOKEN, repo);
      const reviews = (store.reviews || []).sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      return json({ ok: true, storage: 'github', reviews });
    }

    return json({
      ok: true,
      storage: 'none',
      reviews: [],
      setup: {
        message:
          'Connect permanent storage: bind D1 as DB, or set GITHUB_TOKEN secret.',
        d1: 'Pages → Settings → Bindings → D1 → variable name DB',
        github: 'Pages → Settings → Environment variables → GITHUB_TOKEN',
      },
    });
  } catch (err) {
    return json({ ok: false, error: 'Failed to load reviews', reviews: [] }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const env = context.env;
    const mode = storageMode(env);

    if (mode === 'none') {
      return json(
        {
          ok: false,
          error:
            'Database not connected. Bind D1 as DB (recommended) or set GITHUB_TOKEN in Cloudflare Pages secrets.',
        },
        503
      );
    }

    const body = await context.request.json();
    const idToken = (body && body.credential) || '';
    const stars = parseInt(body && body.stars, 10);
    const text = ((body && body.text) || '').trim();

    if (!idToken)
      return json({ ok: false, error: 'Google sign-in required' }, 401);
    if (!(stars >= 1 && stars <= 5))
      return json({ ok: false, error: 'Invalid rating (1–5)' }, 400);
    if (text.length < 3 || text.length > 600)
      return json({ ok: false, error: 'Comment must be 3–600 characters' }, 400);

    const user = await verifyGoogleToken(
      idToken,
      env.GOOGLE_CLIENT_ID || null
    );
    if (!user)
      return json({ ok: false, error: 'Invalid or expired Google token' }, 401);

    const review = {
      id:
        'r_' +
        Date.now().toString(36) +
        '_' +
        Math.random().toString(36).slice(2, 8),
      userId: user.userId,
      name: user.name,
      email: user.email,
      picture: user.picture,
      stars: stars,
      text: text,
      createdAt: new Date().toISOString(),
    };

    if (mode === 'd1') {
      await d1Upsert(env.DB, review);
      return json({ ok: true, storage: 'd1', review });
    }

    // GitHub fallback
    const repo = env.GITHUB_REPO || DEFAULT_REPO;
    const store = await ghGetStore(env.GITHUB_TOKEN, repo);
    let list = (store.reviews || []).filter(function (r) {
      return r.userId !== review.userId;
    });
    list.unshift(review);
    if (list.length > 500) list = list.slice(0, 500);
    await ghPutStore(env.GITHUB_TOKEN, repo, list, store.sha);
    return json({ ok: true, storage: 'github', review });
  } catch (err) {
    return json(
      { ok: false, error: 'Failed to save review', detail: String(err.message || err) },
      500
    );
  }
}
