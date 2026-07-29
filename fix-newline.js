import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">/g,
  '<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">'
);

fs.writeFileSync('src/App.tsx', content);
