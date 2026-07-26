import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Update function signature
content = content.replace(
  'const exportPaperScheduleToPDF = async () => {',
  'const exportPaperScheduleToPDF = async (forTeachers: boolean = false) => {'
);

// 2. Replace map logic for tableData
const mapRegex = /const tableData = sortedExams\.map\(exam => \{[\s\S]*?return \[dateDay, timeText, exam\.subject\.toUpperCase\(\), invigs\];\s*\}\);/;
const newMap = `const tableData = sortedExams.map(exam => {
        const dateDay = \`\${exam.date}\\n\${getDayOfWeek(exam.date)}\`;
        const timeText = \`\${formatTimeAmPm(exam.time)} \${exam.endTime ? '- ' + formatTimeAmPm(exam.endTime) : ''}\`;
        const invigs = exam.invigilators && exam.invigilators.length > 0 ? exam.invigilators.map(i => i.name).join(', ') : 'None';
        return forTeachers 
          ? [dateDay, timeText, exam.subject.toUpperCase(), invigs]
          : [dateDay, timeText, exam.subject.toUpperCase()];
      });`;
content = content.replace(mapRegex, newMap);

// 3. Replace head definition
const headRegex = /head: \[\['DATE & DAY', 'TIME', 'SUBJECT', 'INVIGILATORS'\]\],/;
const newHead = `head: forTeachers 
              ? [['DATE & DAY', 'TIME', 'SUBJECT', 'INVIGILATORS']]
              : [['DATE & DAY', 'TIME', 'SUBJECT']],`;
content = content.replace(headRegex, newHead);

// 4. Update the button
const buttonRegex = /\{\!selectedClassId && activeTab === 'papers' && selectedPaperTypeId && \([\s\S]*?<\/button>\s*\)\}/;
const newButtons = `{!selectedClassId && activeTab === 'papers' && selectedPaperTypeId && (
              <div className="flex gap-2">
                <button onClick={() => exportPaperScheduleToPDF(false)} className="px-4 py-2 text-sm bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm flex items-center gap-2" title="Print for Students (No Invigilators)">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Students</span>
                </button>
                <button onClick={() => exportPaperScheduleToPDF(true)} className="px-4 py-2 text-sm bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm flex items-center gap-2" title="Print for Teachers (With Invigilators)">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Teachers</span>
                </button>
              </div>
            )}`;
content = content.replace(buttonRegex, newButtons);

fs.writeFileSync('src/App.tsx', content);
