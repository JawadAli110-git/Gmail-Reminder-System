import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
    /app\.post\("\/api\/messages\/read", authMiddleware, async \(req: any, res\) => \{\n\s*try \{\n\s*const \{ otherUserEmail \} = req\.body;/g,
    `app.post("/api/messages/read", authMiddleware, async (req: any, res) => {
  try {
    const { otherUserEmail } = req.body;
    const userRole = req.user.role || (req.user.username ? 'admin' : 'user');
    const userEmail = req.user.email || (userRole === 'admin' ? 'admin@example.com' : undefined);`
);

fs.writeFileSync('server.ts', content);
