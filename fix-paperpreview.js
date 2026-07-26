import fs from 'fs';
let content = fs.readFileSync('src/components/PaperSchedulePreview.tsx', 'utf-8');

content = content.replace('<th className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700 w-48">CLASS</th>', '');
content = content.replace(/<td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">\s*\{exam\.classId \? \(classes\.find\(c => c\.id === exam\.classId\)\?\.name \|\| 'Unknown Class'\) : 'Global \(All Classes\)'\}\s*<\/td>/, '');

fs.writeFileSync('src/components/PaperSchedulePreview.tsx', content);
