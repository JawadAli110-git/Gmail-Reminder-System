import fs from 'fs';
let content = fs.readFileSync('src/components/Chatbot.tsx', 'utf-8');

content = content.replace(
  /className="px-6 py-4 border-b border-black\/5 dark:border-white\/5 flex items-center justify-between bg-white\/60 dark:bg-black\/40 text-slate-900 dark:text-white"/,
  'className="px-6 py-4 pt-12 sm:pt-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/60 dark:bg-black/40 text-slate-900 dark:text-white"'
);

fs.writeFileSync('src/components/Chatbot.tsx', content);
