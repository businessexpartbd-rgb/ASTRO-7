import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static site. API lives in /functions (Cloudflare Pages Functions).
// D1 binding name: DB
export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
