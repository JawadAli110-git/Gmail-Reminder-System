import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\{!isAdmin && \(\s*<button\s*onClick=\{\(\) => setIsLoginOpen\(true\)\}\s*className="flex items-center gap-2[^>]*>\s*<LogIn size=\{18\} \/>\s*<span className="hidden sm:inline">Admin Login<\/span>\s*<\/button>\s*\)\}/g;
content = content.replace(regex, '');

fs.writeFileSync('src/App.tsx', content);
