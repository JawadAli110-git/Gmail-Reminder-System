import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf-8');

if (!content.includes('vite-plugin-pwa')) {
  content = content.replace(
    "import {defineConfig} from 'vite';",
    "import {defineConfig} from 'vite';\nimport { VitePWA } from 'vite-plugin-pwa';"
  );
  content = content.replace(
    "plugins: [react(), tailwindcss()],",
    `plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Timetable App',
          short_name: 'Timetable',
          description: 'A simple timetable and reminder app',
          theme_color: '#0f172a',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],`
  );
  fs.writeFileSync('vite.config.ts', content);
}
