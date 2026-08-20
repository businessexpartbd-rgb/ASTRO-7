import { defineConfig } from 'astro/core';
import { defineConfig } from 'astro/config';

// Static site for Cloudflare Workers assets.
// site must be set so canonical/OG URLs are never localhost during build.
export default defineConfig({
  site: 'https://www.creavixit.com',
  output: 'static',
});
