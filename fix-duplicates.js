import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /{isAdmin && <button\s+onClick=\{\(\) => \{\s+triggerHaptic\(\);\s+setIsLogsOpen\(true\);\s+\}\}\s+className="p-3 rounded-full liquid-glass hover:bg-white\/80 dark:hover:bg-black\/60 transition-colors shadow-sm shrink-0"\s+title="Email Logs"\s+>\s+<Activity size=\{20\} \/>\s+<\/button>}\s+{\(isAdmin \|\| isUser\) && <button\s+onClick=\{\(\) => \{\s+triggerHaptic\(\);\s+setIsAdmin\(false\);\s+setIsUser\(false\);\s+localStorage\.removeItem\('adminToken'\);\s+localStorage\.removeItem\('userToken'\);\s+showToast\("Success", "Logged out successfully", "success"\);\s+\}\}\s+className="flex items-center gap-2 px-4 py-2\.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800\/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0"\s+title="Log Out"\s+>\s+<LogOut size=\{18\} \/>\s+<span className="hidden sm:inline">Log Out<\/span>\s+<\/button>}/m;

content = content.replace(regex, "");

fs.writeFileSync('src/App.tsx', content);
