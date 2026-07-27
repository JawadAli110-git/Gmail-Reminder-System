import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf-8');

content = content.replace(
  "includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],",
  "includeAssets: ['pwa-512x512.svg'],"
);

fs.writeFileSync('vite.config.ts', content);
