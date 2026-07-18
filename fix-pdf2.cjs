const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const formattedSubtitle = \`ACADEMIC TIMETABLE - \$\{className\.toUpperCase\(\)\}\`.split\(''\)\.join\(String\.fromCharCode\(8202\)\);\n      doc\.text\(formattedSubtitle, pageWidth \/ 2, 41, \{ align: 'center' \}\);/g,
  `const formattedSubtitle = \`A C A D E M I C   T I M E T A B L E  -  \${className.toUpperCase().split('').join(' ')}\`;\n      doc.text(formattedSubtitle, pageWidth / 2, 41, { align: 'center' });`
);

fs.writeFileSync('src/App.tsx', content);
