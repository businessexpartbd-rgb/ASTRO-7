import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    // static site + functions/ folder for /api/*
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
