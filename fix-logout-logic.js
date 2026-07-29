import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /setIsAccountMenuOpen\(false\);\n\s*showToast\("Success", "Logged out successfully", "success"\);/,
  'setIsAccountMenuOpen(false);\n                        setUserAuthMode(\'login\');\n                        setAuthMode(\'login\');\n                        showToast("Success", "Logged out successfully", "success");'
);

fs.writeFileSync('src/App.tsx', content);
