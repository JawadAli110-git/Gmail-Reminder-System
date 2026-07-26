import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update login success
content = content.replace(
  'setIsAdmin(true);\\n          setIsLoginOpen(false);',
  'setIsAdmin(true);\\n          localStorage.setItem("adminToken", data.token);\\n          setIsLoginOpen(false);'
);

// Update logout
content = content.replace(
  'onClick={() => { triggerHaptic(); setIsAdmin(false); }}',
  'onClick={() => { triggerHaptic(); setIsAdmin(false); localStorage.removeItem("adminToken"); }}'
);

// Add initialization check
content = content.replace(
  'useEffect(() => {',
  'useEffect(() => {\\n    const token = localStorage.getItem("adminToken");\\n    if (token) {\\n      setIsAdmin(true);\\n    }'
);

fs.writeFileSync('src/App.tsx', content);
