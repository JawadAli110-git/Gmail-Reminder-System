import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// For user, call read api when opening modal
content = content.replace(
    /onClick=\{\(\) => \{\n\s*triggerHaptic\(\);\n\s*setIsRequestsModalOpen\(true\);\n\s*\}\}/g,
    `onClick={() => {
                  triggerHaptic();
                  setIsRequestsModalOpen(true);
                  if (isUser && !isAdmin) {
                      window.fetch('/api/messages/read', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('userToken')}\` },
                          body: JSON.stringify({ otherUserEmail: 'admin' })
                      }).then(() => fetchMessages()).catch(console.error);
                  }
                }}`
);

fs.writeFileSync('src/App.tsx', content);
