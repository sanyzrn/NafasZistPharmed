// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  server: { host: true, port: 4321 },
  site: 'https://nafaspharmed.com',
  i18n: {
    defaultLocale: 'fa',
    locales: ['fa', 'ar', 'en', 'ru'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
});
