import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /if \(response\.status === 401\) \{\s*localStorage\.removeItem\('adminToken'\);\s*window\.location\.href = '\/';\s*return new Promise\(\(\) => \{\}\);[^\n]*\n\s*\}/,
  `if (response.status === 401 && !input.toString().includes('/api/auth/login')) {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
    return new Promise(() => {});
  }`
);

fs.writeFileSync('src/App.tsx', content);
