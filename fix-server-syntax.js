import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const badBlockRegex = /\s*const now = new Date\(\);\s*\/\/ Get all unique users[\s\S]*?res\.status\(500\)\.json\(\{ error: e\.message \}\);\s*\}\s*\}\);/g;

content = content.replace(badBlockRegex, '');

fs.writeFileSync('server.ts', content);
