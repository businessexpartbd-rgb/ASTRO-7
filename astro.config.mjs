import { defineConfig } from 'astro/config';

// Static site for Cloudflare Workers assets.
// No Tailwind plugin — it breaks builds on <style is:global>.
export default defineConfig({
  output: 'static',
});
