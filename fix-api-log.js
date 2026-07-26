import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace('console.error("FIREBASE ERROR:", e); res.status(500).json({ error: "Failed to save paper type" });', 'res.status(500).json({ error: "Failed to save paper type", details: e.message || e.toString() });');
fs.writeFileSync('server.ts', content);
