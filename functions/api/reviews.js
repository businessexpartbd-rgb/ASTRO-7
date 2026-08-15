/**
 * Creavix Reviews API
 * Binding required: D1 database as env.DB
 * Optional: env.GOOGLE_CLIENT_ID (same as public/config.json)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};

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
  await db
    .prepare(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)`
    )
    .run();
}

async function verifyGoogleToken(idToken, expectedClientId) {
  const res = await fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken)
  );
  if (!res.ok) return null;
  const payload = await res.json();
  if (payload.error) return null;
  if (expectedClientId && payload.aud !== expectedClientId) return null;
  if (payload.email_verified !== 'true' && payload.email_verified !== true) return null;
  return {
    userId: payload.sub,
    name: payload.name || payload.email || 'User',
    email: payload.email || '',
    picture: payload.picture || '',
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    if (!db) {
      return json({ ok: true, reviews: [], warning: 'DB not bound' });
    }
    await ensureTable(db);
    const { results } = await db
      .prepare(
        `SELECT id, user_id as userId, name, email, picture, stars, body as text, created_at as createdAt
         FROM reviews ORDER BY created_at DESC LIMIT 200`
      )
      .all();
    return json({ ok: true, reviews: results || [] });
  } catch (err) {
    return json({ ok: false, error: 'Failed to load reviews', reviews: [] }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    if (!db) {
      return json(
        {
          ok: false,
          error:
            'Database not connected. Bind D1 as DB in Cloudflare Pages Settings → Bindings.',
        },
        503
      );
    }

    const body = await context.request.json();
    const idToken = (body && body.credential) || '';
    const stars = parseInt(body && body.stars, 10);
    const text = ((body && body.text) || '').trim();

    if (!idToken) return json({ ok: false, error: 'Google sign-in required' }, 401);
    if (!(stars >= 1 && stars <= 5)) return json({ ok: false, error: 'Invalid rating' }, 400);
    if (text.length < 3 || text.length > 600)
      return json({ ok: false, error: 'Comment must be 3–600 characters' }, 400);

    const expectedClientId =
      context.env.GOOGLE_CLIENT_ID || '';
    const user = await verifyGoogleToken(idToken, expectedClientId || null);
    if (!user) return json({ ok: false, error: 'Invalid Google token' }, 401);

    await ensureTable(db);

    const id =
      'r_' +
      Date.now().toString(36) +
      '_' +
      Math.random().toString(36).slice(2, 8);
    const createdAt = new Date().toISOString();

    // One review per Google account — upsert
    await db
      .prepare(`DELETE FROM reviews WHERE user_id = ?`)
      .bind(user.userId)
      .run();

    await db
      .prepare(
        `INSERT INTO reviews (id, user_id, name, email, picture, stars, body, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        user.userId,
        user.name,
        user.email,
        user.picture,
        stars,
        text,
        createdAt
      )
      .run();

    return json({
      ok: true,
      review: {
        id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        picture: user.picture,
        stars,
        text,
        createdAt,
      },
    });
  } catch (err) {
    return json({ ok: false, error: 'Failed to save review' }, 500);
  }
}
