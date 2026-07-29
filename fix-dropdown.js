import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const dropdownMenuUser = `
                    {isUser && !isAdmin && (
                      <div className="border-b border-t border-black/5 dark:border-white/10">
                        <button
                          onClick={() => { setIsAboutModalOpen(true); setIsAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <Info size={16} />
                          About App
                        </button>
                      </div>
                    )}
`;

content = content.replace(
  /                    <button\n                      onClick=\{\(\) => \{\n                        setIsAdmin\(false\);/,
  dropdownMenuUser + '\n                    <button\n                      onClick={() => {\n                        setIsAdmin(false);'
);

fs.writeFileSync('src/App.tsx', content);
