// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The deployed origin, used for canonical URLs. Set SITE_URL when building.
  site: process.env.SITE_URL || 'https://example.com',
});
