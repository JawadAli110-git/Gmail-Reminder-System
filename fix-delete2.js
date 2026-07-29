import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  '    res.status(500).json({ error: e.message });// Chatbot API',
  '    res.status(500).json({ error: e.message });\n  }\n});\n\n// Chatbot API'
);

fs.writeFileSync('server.ts', content);
