const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /img\.src = base64data;/,
  `img.src = base64data as string;`
);

fs.writeFileSync('src/App.tsx', content);
