import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /className="relative w-full max-w-sm max-h-\[95vh\] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"/,
  'className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white flex flex-col"'
);

fs.writeFileSync('src/App.tsx', content);
