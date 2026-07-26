import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix exportPaperScheduleToPDF
// Replace the mapping block
const mapRegex = /const tableData = sortedExams\.map\(exam => \{[\s\S]*?return \[dateDay, timeText, exam\.subject\.toUpperCase\(\), className, invigs\];\s*\}\);/;
const newMap = `const tableData = sortedExams.map(exam => {
        const dateDay = \`\${exam.date}\\n\${getDayOfWeek(exam.date)}\`;
        const timeText = \`\${formatTimeAmPm(exam.time)} \${exam.endTime ? '- ' + formatTimeAmPm(exam.endTime) : ''}\`;
        const invigs = exam.invigilators && exam.invigilators.length > 0 ? exam.invigilators.map(i => i.name).join(', ') : 'None';
        return [dateDay, timeText, exam.subject.toUpperCase(), invigs];
      });`;
content = content.replace(mapRegex, newMap);

// Replace head
const headRegex = /head: \[\['DATE & DAY', 'TIME', 'SUBJECT', 'CLASS', 'INVIGILATORS'\]\],/;
const newHead = `head: [['DATE & DAY', 'TIME', 'SUBJECT', 'INVIGILATORS']],`;
content = content.replace(headRegex, newHead);

// Replace margin in paper pdf
const paperMarginRegex = /margin: \{ left: 14, right: 14 \}/;
const newPaperMargin = `margin: { left: 24, right: 24 }`;
content = content.replace(paperMarginRegex, newPaperMargin);

// Replace footer roundedRect
const rectRegex = /doc\.roundedRect\(14, lastTableY \+ 10, pageWidth - 28, 24, 2, 2, 'FD'\);/;
const newRect = `doc.roundedRect(24, lastTableY + 10, pageWidth - 48, 24, 2, 2, 'FD');`;
content = content.replace(rectRegex, newRect);

// Replace instruction text x
content = content.replace(/doc\.text\("Important Instructions:", 18, lastTableY \+ 16\);/, 'doc.text("Important Instructions:", 28, lastTableY + 16);');
content = content.replace(/doc\.text\("• All students must be present 15 minutes prior to the commencement of their scheduled paper\.", 18, lastTableY \+ 22\);/, 'doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled paper.", 28, lastTableY + 22);');
content = content.replace(/doc\.text\("• The administration reserves the right to modify the schedule; please refer to official notice boards for updates\.", 18, lastTableY \+ 28\);/, 'doc.text("• The administration reserves the right to modify the schedule; please refer to official notice boards for updates.", 28, lastTableY + 28);');

// Replace Issue Date
content = content.replace(/doc\.text\(\`Issue Date: \$\{new Date\(\)\.toLocaleDateString\('en-US', \{ day: '2-digit', month: 'short', year: 'numeric' \}\)\}\`, 14, pageHeight - 20\);/, 'doc.text(`Issue Date: ${new Date().toLocaleDateString(\'en-US\', { day: \'2-digit\', month: \'short\', year: \'numeric\' })}`, 24, pageHeight - 20);');

// Replace signature line and text
content = content.replace(/doc\.line\(pageWidth - 70, pageHeight - 25, pageWidth - 14, pageHeight - 25\);/, 'doc.line(pageWidth - 74, pageHeight - 25, pageWidth - 24, pageHeight - 25);');
content = content.replace(/doc\.text\("Principal \/ Administrator", pageWidth - 42, pageHeight - 20, \{ align: 'center' \}\);/, 'doc.text("Principal / Administrator", pageWidth - 49, pageHeight - 20, { align: \'center\' });');

// Now fix exportToPDF
content = content.replace(/doc\.text\(\`Issue Date: \$\{new Date\(\)\.toLocaleDateString\('en-US', \{ day: '2-digit', month: 'short', year: 'numeric' \}\)\}\`, 20, pageHeight - 20\);/, 'doc.text(`Issue Date: ${new Date().toLocaleDateString(\'en-US\', { day: \'2-digit\', month: \'short\', year: \'numeric\' })}`, 24, pageHeight - 20);');
content = content.replace(/doc\.line\(pageWidth - 70, pageHeight - 25, pageWidth - 20, pageHeight - 25\);/, 'doc.line(pageWidth - 74, pageHeight - 25, pageWidth - 24, pageHeight - 25);');
content = content.replace(/doc\.text\("Principal \/ Administrator", pageWidth - 45, pageHeight - 20, \{ align: 'center' \}\);/, 'doc.text("Principal / Administrator", pageWidth - 49, pageHeight - 20, { align: \'center\' });');

// also slightly increase margin for exportToPDF table if it's 20, make it 24
content = content.replace(/margin: \{ left: 20, right: 20 \}/, 'margin: { left: 24, right: 24 }');
// and its footer rectangle
content = content.replace(/doc\.roundedRect\(20, lastTableY \+ 10, pageWidth - 40, 24, 2, 2, 'FD'\);/, 'doc.roundedRect(24, lastTableY + 10, pageWidth - 48, 24, 2, 2, \'FD\');');
// and instruction text x for exportToPDF
content = content.replace(/doc\.text\("Important Instructions:", 24, lastTableY \+ 16\);/, 'doc.text("Important Instructions:", 28, lastTableY + 16);');
content = content.replace(/doc\.text\("• All students must be present 15 minutes prior to the commencement of their scheduled class\.", 24, lastTableY \+ 22\);/, 'doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled class.", 28, lastTableY + 22);');
content = content.replace(/doc\.text\("• The administration reserves the right to modify the timetable; please refer to official notice boards for updates\.", 24, lastTableY \+ 28\);/, 'doc.text("• The administration reserves the right to modify the timetable; please refer to official notice boards for updates.", 28, lastTableY + 28);');

fs.writeFileSync('src/App.tsx', content);
