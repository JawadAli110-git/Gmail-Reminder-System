import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf-8');

content = content.replace(
  "registerType: 'autoUpdate',",
  "registerType: 'autoUpdate',\n        injectRegister: 'auto',"
);
fs.writeFileSync('vite.config.ts', content);
