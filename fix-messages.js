import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
    /if \(req\.user\.role === 'user'\) \{/g,
    `const userRole = req.user.role || (req.user.username ? 'admin' : 'user');
    const userEmail = req.user.email || (userRole === 'admin' ? 'admin@example.com' : undefined);
    
    if (userRole === 'user') {`
);

content = content.replace(
    /req\.user\.email/g,
    `userEmail`
);

content = content.replace(
    /req\.user\.role/g,
    `userRole`
);

fs.writeFileSync('server.ts', content);
