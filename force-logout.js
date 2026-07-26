import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  'const token = localStorage.getItem("adminToken");\n    if (token) {\n      setIsAdmin(true);\n    }',
  `const token = localStorage.getItem("adminToken");\n    if (token) {\n      setIsAdmin(true);\n    } else {\n      setIsAdmin(false);\n    }`
);
fs.writeFileSync('src/App.tsx', content);
