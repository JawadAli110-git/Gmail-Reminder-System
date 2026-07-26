import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace(
  'const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");',
  'const JWT_SECRET = process.env.JWT_SECRET || "fallback_static_secret_for_dev_12345";'
);
fs.writeFileSync('server.ts', content);
