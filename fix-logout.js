import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /setIsAdmin\(false\);\n\s*showToast\("Success", "Logged out successfully", "success"\);/,
  `setIsAdmin(false);
                localStorage.removeItem('adminToken');
                showToast("Success", "Logged out successfully", "success");`
);

fs.writeFileSync('src/App.tsx', content);
