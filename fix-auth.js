import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /if \(data\.success\) \{\n          setIsAdmin\(true\);/,
  `if (data.success) {
          localStorage.setItem('adminToken', data.token);
          setIsAdmin(true);`
);

fs.writeFileSync('src/App.tsx', content);
