import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'localStorage.removeItem(\'userToken\');\\n                showToast("Success", "Logged out successfully", "success");',
  'localStorage.removeItem(\'userToken\');\\n                setIsUser(false);\\n                showToast("Success", "Logged out successfully", "success");'
);

fs.writeFileSync('src/App.tsx', content);
