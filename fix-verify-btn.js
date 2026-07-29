import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /userAuthMode === 'forgot' \? 'Send Reset Code' : 'Reset Password'\}/,
  "userAuthMode === 'verify-signup' ? 'Verify Account' : userAuthMode === 'forgot' ? 'Send Reset Code' : 'Reset Password'}"
);

fs.writeFileSync('src/App.tsx', content);
