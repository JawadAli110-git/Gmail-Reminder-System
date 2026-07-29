import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /className="relative w-full max-w-3xl h-\[85vh\] flex flex-col liquid-glass-heavy rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white"/g,
  'className="relative w-full max-w-3xl h-[100dvh] sm:h-[85vh] flex flex-col liquid-glass-heavy rounded-none sm:rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white"'
);

fs.writeFileSync('src/App.tsx', content);
