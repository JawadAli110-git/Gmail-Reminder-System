import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Remove broadcast API
const broadcastRegex = /app\.post\("\/api\/messages\/broadcast", authMiddleware, async \(req: any, res\) => \{[\s\S]*?\}\);/g;
content = content.replace(broadcastRegex, '');

fs.writeFileSync('server.ts', content);
