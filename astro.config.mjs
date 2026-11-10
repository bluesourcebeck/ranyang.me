// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { URLS } from './src/config.ts';

export default defineConfig({
  site: URLS.site,
  output: 'static',
  integrations: [mdx(), react(), tailwind({ applyBaseStyles: false }), sitemap()],
});
