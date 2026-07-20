const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

if (!content.includes('@custom-variant dark')) {
  content = content.replace('@import "tailwindcss";', '@import "tailwindcss";\n@custom-variant dark (&:is(.dark *));');
}

fs.writeFileSync('src/index.css', content);
