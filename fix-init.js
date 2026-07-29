import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'initAdmin();',
  'initAdmin().catch(console.error);'
);

fs.writeFileSync('server.ts', content);
