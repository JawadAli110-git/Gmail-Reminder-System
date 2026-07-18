const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix header layout
content = content.replace(
  /<div className="flex flex-wrap items-center gap-3 no-print">/g,
  '<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 no-print">'
);
content = content.replace(
  /<div className="flex items-center gap-2 px-3 py-2 rounded-2xl liquid-glass shadow-sm">/g,
  '<div className="flex items-center gap-2 px-3 py-2 rounded-full liquid-glass shadow-sm">'
);

// Fix form layout overlapping - making form responsive and spacious
content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">/g,
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">'
);
// In App.tsx forms:
content = content.replace(
  /<div className="space-y-4">[\s\S]*?<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">/g,
  '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\n<div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">'
);

fs.writeFileSync('src/App.tsx', content);
