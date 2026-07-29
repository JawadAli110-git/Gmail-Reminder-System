import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace(
  'status: \'pending\' | \'approved\' | \'disapproved\';',
  'status: \'pending\' | \'approved\' | \'disapproved\';\n  readByUser?: boolean;\n  readByAdmin?: boolean;'
);
fs.writeFileSync('src/types.ts', content);
