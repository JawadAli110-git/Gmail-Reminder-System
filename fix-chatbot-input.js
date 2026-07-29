import fs from 'fs';
let content = fs.readFileSync('src/components/Chatbot.tsx', 'utf-8');

content = content.replace(
  /className="p-4 bg-white\/60 dark:bg-black\/40 border-t border-black\/5 dark:border-white\/5"/,
  'className="p-4 pb-12 sm:pb-4 bg-white/60 dark:bg-black/40 border-t border-black/5 dark:border-white/5"'
);

fs.writeFileSync('src/components/Chatbot.tsx', content);
