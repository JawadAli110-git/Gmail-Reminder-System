const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const targets = \[60, offset\];/,
  `const targets = Array.from(new Set([60, offset]));`
);

fs.writeFileSync('server.ts', content);
