import fs from 'fs';

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="100" fill="#0f172a"/>
  <path d="M128 128H384V384H128V128Z" stroke="white" stroke-width="32" stroke-linejoin="round"/>
  <path d="M128 200H384M200 128V384M280 128V384M384 280H128" stroke="white" stroke-width="32" stroke-linecap="round"/>
</svg>
`;

fs.writeFileSync('public/pwa-512x512.svg', svgIcon);
// Using SVG as PNG fallback for now by copying. The browser usually accepts SVG if named .png or we can just update vite.config.ts to use .svg

