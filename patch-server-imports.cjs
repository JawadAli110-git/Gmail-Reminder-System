const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace("import { getDoc } from 'firebase/firestore';", "");

fs.writeFileSync('server.ts', content);
