# Creavix Reviews — Permanent Database Setup

এক লাখ ডলার-লেভেল সাইটের জন্য **স্থায়ী database** লাগবে। নিচের **একবারের** সেটআপ করুন।

---

## সুপারিশ: Cloudflare D1 (সেরা)

### ধাপ ১ — Database তৈরি
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) লগইন
2. বাম মেনু → **Workers & Pages** → **D1** → **Create database**
3. Name: `creavix-reviews` → Create

### ধাপ ২ — Table (অটোও হয়, ম্যানুয়াল চাইলে)
D1 → আপনার DB → **Console** → Run:

```sql
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  picture TEXT,
  stars INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
```

> API প্রথম রিকোয়েস্টে table অটো তৈরি করে (`ensureTable`).

### ধাপ ৩ — Pages-এ Bind (খুব জরুরি)
1. **Workers & Pages** → আপনার **creavix / ASTRO-7** প্রজেক্ট
2. **Settings** → **Bindings** → **Add**
3. Type: **D1 database**
4. Variable name: **`DB`**  ← অবশ্যই এই নাম
5. Database: `creavix-reviews`
6. Save → **Redeploy** (Deployments → Retry deployment)

---

## Google Login (Client ID)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth client ID** → Web application
3. Authorized JavaScript origins:
   - `https://creavixit.com`
   - `https://www.creavixit.com`
4. Client ID কপি → GitHub ফাইল `public/config.json`:

```json
{
  "googleClientId": "123456789-xxxx.apps.googleusercontent.com"
}
```

5. (ঐচ্ছিক) Cloudflare Pages → Settings → Variables →
   `GOOGLE_CLIENT_ID` = একই Client ID  
   `GITHUB_TOKEN` শুধু fallback চাইলে

---

## Fallback: GitHub file storage

D1 না থাকলে `GITHUB_TOKEN` দিয়ে `data/reviews-db.json` এ সেভ হয়।

1. GitHub → Settings → Developer settings → Personal access tokens
2. Fine-grained token → শুধু `ASTRO-7` repo → **Contents: Read and write**
3. Cloudflare Pages → Environment variables (Secret):
   - `GITHUB_TOKEN` = token
   - `GITHUB_REPO` = `businessexpartbd-rgb/ASTRO-7` (ঐচ্ছিক)

---

## চেক

```
GET  https://creavixit.com/api/reviews
→ { "ok": true, "storage": "d1", "reviews": [] }
```

`storage: "none"` দেখালে Binding/Secret এখনও লাগে।
