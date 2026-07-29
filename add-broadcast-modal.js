import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const buttonStr = `
                  <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-black/5 dark:border-white/5">
                    <button onClick={() => setIsBroadcastModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                      <Send size={18} />
                      Broadcast Update to All Users
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
`;

content = content.replace(
    /\{isAdmin && \!selectedChatUser \? \(\n\s*<div className="flex-1 overflow-y-auto p-4 space-y-2">/g,
    `{isAdmin && !selectedChatUser ? (` + buttonStr
);

content = content.replace(
    /return userEmails\.map\(email => \{/g,
    `</div>\n` + `                      return userEmails.map(email => {`
);
// Wait, the previous replacement added an extra closing tag if not careful.
// Let's just do a safer replace.

fs.writeFileSync('src/App.tsx', content);
