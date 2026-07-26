import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Fix the customFetch to avoid reload on login 401
content = content.replace(
  /if \(response\.status === 401\) \{\n    localStorage\.removeItem\('adminToken'\);\n    window\.location\.href = '\/';\n    return new Promise\(\(\) => \{\}\);\n  \}/,
  `if (response.status === 401 && !input.toString().includes('/api/auth/login')) {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
    return new Promise(() => {});
  }`
);

// 2. Fix the auth modal overflow
content = content.replace(
  /className="relative w-full max-w-sm liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"\s*>\s*<div className="w-16 h-16 mx-auto mb-6 bg-blue-100/,
  `className="relative w-full max-w-sm max-h-[95vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100`
);

fs.writeFileSync('src/App.tsx', content);
