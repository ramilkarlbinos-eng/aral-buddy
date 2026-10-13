import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    // 1. ADDED BASE PATH HERE FOR GITHUB PAGES
    base: '/aral-buddy/',

    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          // 2. UPDATED PATHS HERE TO MATCH YOUR REPOSITORY NAME
          id: '/aral-buddy/',
          name: 'ARAL Buddy - DepEd Tutor Companion',
          short_name: 'ARAL Buddy',
          description: 'ARAL Tutor Buddy: track tutees, intervention sessions, daily time records (DTR Form 48), and weekly progress.',
          theme_color: '#173b3a',
          background_color: '#173b3a',
          display: 'standalone',
          start_url: '/aral-buddy/',
          scope: '/aral-buddy/',
          icons: [
            {
              src: 'icon.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
