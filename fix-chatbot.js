import fs from 'fs';
let content = fs.readFileSync('src/components/Chatbot.tsx', 'utf-8');

content = content.replace(
  /className="fixed bottom-6 right-6 w-\[350px\] sm:w-\[400px\] h-\[500px\] liquid-glass-heavy rounded-3xl flex flex-col overflow-hidden z-50 shadow-2xl text-slate-900 dark:text-white bg-slate-50\/95 dark:bg-black\/80 backdrop-blur-xl border border-white\/40 dark:border-white\/10"/,
  'className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[100dvh] sm:h-[600px] sm:rounded-3xl flex flex-col overflow-hidden z-50 shadow-2xl text-slate-900 dark:text-white bg-slate-50/95 dark:bg-black/80 backdrop-blur-xl sm:border border-white/40 dark:border-white/10"'
);

fs.writeFileSync('src/components/Chatbot.tsx', content);
