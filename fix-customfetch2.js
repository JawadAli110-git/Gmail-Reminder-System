import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /if \(response\.status === 401 && !input\.toString\(\)\.includes\('\/api\/auth\/login'\)\) \{/,
  `const urlString = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
  if (response.status === 401 && !urlString.includes('/api/auth/login')) {`
);

fs.writeFileSync('src/App.tsx', content);
