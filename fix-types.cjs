const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  /teacherEmail: string;/g,
  "teacherEmail: string;\n  taName?: string;\n  taEmail?: string;"
);

fs.writeFileSync('src/types.ts', content);
