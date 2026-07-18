const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /let logoLoaded = false;\s+try \{\s+const img = new Image\(\);\s+img\.src = '\/logo\.jpg';\s+await new Promise\(\(resolve\) => \{\s+img\.onload = \(\) => \{\s+const imgHeight = 22;\s+const imgWidth = \(img\.width \* imgHeight\) \/ img\.height;\s+\/\/ Place logo\s+doc\.addImage\(img, 'JPEG', 20, 20, imgWidth, imgHeight\);\s+logoLoaded = true;\s+resolve\(true\);\s+\};\s+img\.onerror = \(\) => resolve\(false\);\s+setTimeout\(\(\) => resolve\(false\), 1000\);\s+\}\);\s+\} catch \(e\) \{\}/,
  `let logoLoaded = false;
      try {
        const response = await fetch('/logo.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        const base64data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        
        const img = new Image();
        img.src = base64data;
        await new Promise((resolve) => {
          img.onload = () => {
            const imgHeight = 22;
            const imgWidth = (img.width * imgHeight) / img.height;
            doc.addImage(img, 'JPEG', 20, 20, imgWidth, imgHeight);
            logoLoaded = true;
            resolve(true);
          };
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2000);
        });
      } catch (e) {
        console.error("Logo failed to load:", e);
      }`
);

fs.writeFileSync('src/App.tsx', content);
