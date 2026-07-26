import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/join\("\n"\)/g, 'join("\\\\n")');
content = content.replace(/cellText \+= "\n"/g, 'cellText += "\\\\n"');
content = content.replace(/join\(""/g, 'join("\\\\n"');
content = content.replace(/cellText \+= ""/g, 'cellText += "\\\\n"');
fs.writeFileSync('src/App.tsx', content);
