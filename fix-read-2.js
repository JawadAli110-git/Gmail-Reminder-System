import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    /window\.fetch\('\/api\/messages\/read', \{\n\s*method: 'PUT',\n\s*headers: \{ 'Content-Type': 'application\/json', 'Authorization': `Bearer \$\{localStorage\.getItem\('userToken'\)\}` \},\n\s*body: JSON\.stringify\(\{ otherUserEmail: 'admin' \}\)\n\s*\}\)/g,
    `customFetch('/api/messages/read', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ otherUserEmail: 'admin' })
                      })`
);

fs.writeFileSync('src/App.tsx', content);
