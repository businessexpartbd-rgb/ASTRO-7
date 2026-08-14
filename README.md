# ASTRO-7 / Union Global

Premium **$100k-level** website built with **Astro + Tailwind CSS + SCSS + Glassmorphism**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Astro 7** |
| Styling | **Tailwind CSS v4** + **SCSS** |
| Components | Astro Components (`GlassCard` etc.) |
| Animations | Custom CSS + Intersection Observer |
| Design System | Multi-color sections, Glassmorphism, Premium fonts |

## Project Structure

```
├── astro.config.mjs
├── package.json
├── src/
│   ├── components/
│   │   └── GlassCard.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       ├── base/
│       │   ├── _variables.scss
│       │   └── _mixins.scss
│       ├── components/
│       │   └── _glass.scss
│       └── main.scss
└── pages/                  (legacy static HTML pages)
    ├── network.html
    ├── insights.html
    └── careers.html
```

## Features

- ✅ Premium Glassmorphism system (`.glass-card`, variants)
- ✅ SCSS Design Tokens + Mixins
- ✅ Tailwind CSS integration
- ✅ Unique multi-color section themes
- ✅ Living animations (float, reveal, pulse, glow)
- ✅ Fully responsive
- ✅ SEO-ready Layout

## Getting Started

```bash
npm install
npm run dev
```

## Glass Card Usage

```astro
---
import GlassCard from '../components/GlassCard.astro';
---

<GlassCard>
  <h3>Title</h3>
  <p>Content</p>
</GlassCard>

<GlassCard variant="strong">...</GlassCard>
<GlassCard variant="gold">...</GlassCard>
<GlassCard variant="light">...</GlassCard>
```

---

Built for **Union Global** — Connecting Markets with Integrity & Innovation.
