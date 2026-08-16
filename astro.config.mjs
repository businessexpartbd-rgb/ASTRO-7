import { defineConfig } from 'astro/config';

// Static site for Cloudflare Workers assets.
// Tailwind plugin removed: it crashes Astro builds on <style is:global> blocks.
export default defineConfig({
  output: 'static',
});
