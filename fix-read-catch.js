import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /customFetch\(\`\/api\/requests\/\$\{r\.id\}\/read\`\, \{ method\: \"PUT\" \}\)\.then\(\(\) \=\> fetchTeacherRequests\(\)\)\;/g,
  'customFetch(`/api/requests/${r.id}/read`, { method: "PUT" }).then(() => fetchTeacherRequests()).catch(console.error);'
);

fs.writeFileSync('src/App.tsx', content);
