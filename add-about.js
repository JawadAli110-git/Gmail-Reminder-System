import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add states
content = content.replace(
  /const \[isAccountMenuOpen, setIsAccountMenuOpen\] = useState\(false\);/,
  `const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [appInfo, setAppInfo] = useState<any>(null);`
);

// Add useEffect to fetch app info
const fetchAppInfo = `
  useEffect(() => {
    fetch('/api/app-info').then(res => res.json()).then(data => setAppInfo(data)).catch(console.error);
  }, []);
`;
content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \('setAppBadge' in navigator/,
  fetchAppInfo + '\n  useEffect(() => {\n    if (\'setAppBadge\' in navigator'
);

// Update dropdown menu
const dropdownMenuUser = `
                    {isUser && !isAdmin && (
                      <div className="border-t border-black/5 dark:border-white/10">
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
  /\{\/\* Logout \*\/\}/,
  dropdownMenuUser + '\n                    {/* Logout */}'
);

fs.writeFileSync('src/App.tsx', content);
