import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  /\s*\}\);\s*\}\);\s*\}\);\s*app\.get\("\/api\/messages", authMiddleware, async \(req: any, res\) => \{/g,
  '\n  });\n});\n\napp.get("/api/messages", authMiddleware, async (req: any, res) => {'
);

fs.writeFileSync('server.ts', content);
