import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /if \(response\.status === 401\) \{\n    localStorage\.removeItem\('adminToken'\);\n    window\.location\.reload\(\);\n  \}/,
  `if (response.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
    return new Promise(() => {}); // block execution so no misleading toasts are shown
  }`
);

fs.writeFileSync('src/App.tsx', content);
