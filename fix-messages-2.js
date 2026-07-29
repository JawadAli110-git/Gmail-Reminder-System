import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
    /const userRole = userRole \|\|/g,
    `const userRole = req.user.role ||`
);

content = content.replace(
    /const userEmail = userEmail \|\|/g,
    `const userEmail = req.user.email ||`
);

fs.writeFileSync('server.ts', content);
