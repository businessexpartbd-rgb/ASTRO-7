# Creavix guest reviews — Cloudflare D1 setup

The homepage review UI, `/api/reviews` Worker API, and automatic `DB` binding are implemented.

## Automatic provisioning

The committed `wrangler.jsonc` intentionally defines the `DB` binding without a database ID. Wrangler 4.125 automatically provisions the D1 resource during the next deployment. The Worker creates the schema safely on the first API request.

## Manual fallback

Only use the following steps if automatic provisioning is disabled for the Cloudflare account.

### 1. Create the database

```bash
npx wrangler d1 create creavix-reviews
```

Copy the returned database ID into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "creavix-reviews",
    "database_id": "PASTE_DATABASE_ID",
    "migrations_dir": "./migrations"
  }
]
```

The binding name must remain `DB`.

### 2. Apply the schema

```bash
npx wrangler d1 execute creavix-reviews --remote --file ./migrations/reviews.sql
```

The Worker also creates the table safely on the first request, but applying the migration before deployment is preferred.

## Optional bot protection

Create a Turnstile widget for `creavixit.com`, put its public site key in `public/config.json`, and store its secret as a Worker secret:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put REVIEW_HASH_SECRET
```

Never commit either secret. If Turnstile is not configured, the API still uses the honeypot, anonymous visitor hash, duplicate detection, and a two-reviews-per-hour limit.

## Deploy and verify

```bash
npm run build
npx wrangler deploy
```

Check:

```text
GET https://creavixit.com/api/reviews
```

The response must contain `"storage":"d1"`. If it says `"storage":"seed"`, the D1 binding is not connected.
