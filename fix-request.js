import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /handleRequestSubmit\(e\)\.then\(\(\) \=\> setIsComposingRequest\(false\)\)/g,
  'handleRequestSubmit(e).then(() => setIsComposingRequest(false)).catch(console.error)'
);

fs.writeFileSync('src/App.tsx', content);
