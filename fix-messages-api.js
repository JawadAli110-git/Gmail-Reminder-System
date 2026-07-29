import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
    /const userEmail = req\.user\.email \|\| \(userRole === 'admin' \? 'admin@example\.com' : undefined\);/g,
    `const userEmail = req.user.email || (userRole === 'admin' ? 'admin@example.com' : 'user@example.com');`
);

fs.writeFileSync('server.ts', content);
