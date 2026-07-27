import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf-8');

content = content.replace(
  '</head>',
  `  <meta name="theme-color" content="#0f172a" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Timetable">
    <link rel="apple-touch-icon" href="/pwa-512x512.svg">
    <link rel="icon" type="image/svg+xml" href="/pwa-512x512.svg" />
    <link rel="mask-icon" href="/pwa-512x512.svg" color="#0f172a">
  </head>`
);

fs.writeFileSync('index.html', content);
