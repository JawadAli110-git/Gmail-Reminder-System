import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'startServer();',
  'startServer().catch(console.error);'
);

fs.writeFileSync('server.ts', content);
