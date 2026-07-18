const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /\/\/ VIP Border - Outer border VERY BOLD\s+doc\.setDrawColor\(20, 30, 60\); \/\/ Deep Navy\s+doc\.setLineWidth\(4\);\s+doc\.rect\(10, 10, pageWidth - 20, pageHeight - 20\);\s+doc\.setDrawColor\(20, 30, 60\); \s+doc\.setLineWidth\(1\.5\);\s+doc\.rect\(15, 15, pageWidth - 30, pageHeight - 30\);/g,
  `// VIP Border - Normal
      doc.setDrawColor(20, 30, 60); // Deep Navy
      doc.setLineWidth(1);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setDrawColor(20, 30, 60); 
      doc.setLineWidth(0.5);
      doc.rect(14, 14, pageWidth - 28, pageHeight - 28);`
);

content = content.replace(
  /doc\.text\(\`ACADEMIC TIMETABLE - \$\{className\.toUpperCase\(\)\}\`, pageWidth \/ 2, 41, \{ align: 'center', charSpace: 1\.5 \}\);/g,
  `const formattedSubtitle = \`ACADEMIC TIMETABLE - \${className.toUpperCase()}\`.split('').join(String.fromCharCode(8202));\n      doc.text(formattedSubtitle, pageWidth / 2, 41, { align: 'center' });`
);

fs.writeFileSync('src/App.tsx', content);
