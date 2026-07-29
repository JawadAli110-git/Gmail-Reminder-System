import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'onClick={() => {\n                triggerHaptic();\n                setIsAdmin(false);\n                localStorage.removeItem(\'adminToken\');\n                showToast("Success", "Logged out successfully", "success");',
  'onClick={() => {\n                triggerHaptic();\n                setIsAdmin(false);\n                setIsUser(false);\n                localStorage.removeItem(\'adminToken\');\n                localStorage.removeItem(\'userToken\');\n                showToast("Success", "Logged out successfully", "success");'
);

content = content.replace(
  '{isAdmin && <button\n              onClick={() => {\n                triggerHaptic();\n                setIsAdmin(false);\n                setIsUser(false);\n                localStorage.removeItem(\'adminToken\');\n                localStorage.removeItem(\'userToken\');\n                showToast("Success", "Logged out successfully", "success");',
  '{(isAdmin || isUser) && <button\n              onClick={() => {\n                triggerHaptic();\n                setIsAdmin(false);\n                setIsUser(false);\n                localStorage.removeItem(\'adminToken\');\n                localStorage.removeItem(\'userToken\');\n                showToast("Success", "Logged out successfully", "success");'
);

fs.writeFileSync('src/App.tsx', content);
