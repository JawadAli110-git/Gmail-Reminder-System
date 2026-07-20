const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `                        <h3 className="text-xl font-bold mb-1 line-clamp-1">{entry.subject}</h3>
                        <div className="space-y-2 mt-4 text-sm text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <User size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">{entry.teacherName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                            <span className="truncate text-slate-800 dark:text-slate-200">{entry.teacherEmail}</span>
                          </div>
                          {entry.taName && (
                            <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-2 mt-2">
                              <User size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                              <span className="font-medium text-slate-900 dark:text-slate-100">TA: {entry.taName}</span>
                            </div>
                          )}
                          {entry.taEmail && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                              <span className="truncate text-slate-800 dark:text-slate-200">{entry.taEmail}</span>
                            </div>
                          )}
                        </div>`;

content = content.replace(
  /                        <h3 className="text-xl font-bold mb-1 line-clamp-1">\{entry\.subject\}<\/h3>\s*<div className="space-y-2 mt-4 text-sm text-slate-700 dark:text-slate-300">\s*<div className="flex items-center gap-2">\s*<User size=\{14\} className="opacity-70 text-slate-900 dark:text-slate-100" \/>\s*<span className="font-medium text-slate-900 dark:text-slate-100">\{entry\.teacherName\}<\/span>\s*<\/div>\s*<div className="flex items-center gap-2">\s*<Mail size=\{14\} className="opacity-70 text-slate-900 dark:text-slate-100" \/>\s*<span className="truncate text-slate-800 dark:text-slate-200">\{entry\.teacherEmail\}<\/span>\s*<\/div>\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/App.tsx', content);
