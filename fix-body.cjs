const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace(
  /body \{\s*@apply antialiased text-slate-900 bg-slate-50 transition-colors duration-500 ease-in-out;\s*font-family: var\(--font-sans\);\s*\}\s*\.dark body \{\s*@apply text-slate-50 bg-slate-950;\s*\}/,
  `body {
    @apply antialiased text-slate-900 bg-slate-50 dark:text-slate-50 dark:bg-slate-950 transition-colors duration-500 ease-in-out;
    font-family: var(--font-sans);
  }`
);

fs.writeFileSync('src/index.css', content);
