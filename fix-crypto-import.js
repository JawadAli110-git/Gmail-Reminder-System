import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Remove JWT_SECRET from current location
content = content.replace(/const JWT_SECRET = process.env.JWT_SECRET \|\| crypto.randomBytes\(32\).toString\("hex"\);\n/g, '');

// Insert it right after the crypto import
content = content.replace(/import crypto from 'crypto';\nimport jwt from "jsonwebtoken";/g, 'import crypto from \'crypto\';\nimport jwt from "jsonwebtoken";\nconst JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");');

fs.writeFileSync('server.ts', content);
