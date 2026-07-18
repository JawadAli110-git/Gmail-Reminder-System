const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("img.src = '/logo.png';", "img.src = '/logo.jpg';");
content = content.replace("doc.addImage(img, 'PNG',", "doc.addImage(img, 'JPEG',");

fs.writeFileSync('src/App.tsx', content);
