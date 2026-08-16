# Creavix Reviews — Firebase Auth + Firestore (Free)

একবার সেটআপ · সম্পূর্ণ ফ্রি (Spark plan)

## ১. Firebase প্রজেক্ট

1. https://console.firebase.google.com/ → **Add project**
2. নাম: `creavix-reviews` (বা যেকোনো)
3. Google Analytics: Optional (বন্ধ রাখতে পারেন)
4. **Create project**

> Spark (free) plan-এ সাধারণত **কার্ড লাগে না** Auth + Firestore basic ব্যবহারের জন্য।

## ২. Authentication — Google

1. **Build** → **Authentication** → **Get started**
2. **Sign-in method** → **Google** → **Enable** → Save
3. Support email সিলেক্ট করুন

## ৩. Firestore Database

1. **Build** → **Firestore Database** → **Create database**
2. Mode: **Start in production mode** (পরে rules দেব)
3. Location: `asia-south1` (বা কাছের)
4. Enable

### Rules (Rules ট্যাব → Publish)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{userId} {
      allow read: if true;
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.stars is int
        && request.resource.data.stars >= 1
        && request.resource.data.stars <= 5
        && request.resource.data.text is string
        && request.resource.data.text.size() >= 3
        && request.resource.data.text.size() <= 600;
      allow delete: if false;
    }
  }
}
```

## ৪. Web App Config

1. Project Overview → **</>** (Web)
2. App nickname: `creavixit`
3. **Register app**
4. যে `firebaseConfig` অবজেক্ট দেখাবে, সেগুলো কপি করুন

## ৫. সাইটে বসান

`public/config.json`:

```json
{
  "googleClientId": "",
  "firebase": {
    "apiKey": "AIza...",
    "authDomain": "YOUR_PROJECT.firebaseapp.com",
    "projectId": "YOUR_PROJECT_ID",
    "storageBucket": "YOUR_PROJECT.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abc"
  }
}
```

GitHub-এ push / save করলে সাইট অটো আপডেট হবে।

## ৬. Authorized domain

Firebase → Authentication → **Settings** → **Authorized domains**

যোগ করুন:
- `creavixit.com`
- `www.creavixit.com`

## চেক

1. https://creavixit.com → Reviews → **Continue with Google**
2. অ্যাকাউন্ট সিলেক্ট → স্টার + কমেন্ট → Post
3. Firestore → `reviews` কালেকশনে ডকুমেন্ট দেখা যাবে
