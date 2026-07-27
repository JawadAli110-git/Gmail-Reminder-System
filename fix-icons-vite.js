import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf-8');

content = content.replace(/pwa-192x192\.png/g, 'pwa-512x512.svg');
content = content.replace(/pwa-512x512\.png/g, 'pwa-512x512.svg');
content = content.replace(/image\/png/g, 'image/svg+xml');

fs.writeFileSync('vite.config.ts', content);
