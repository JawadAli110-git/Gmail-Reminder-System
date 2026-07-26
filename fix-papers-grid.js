import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The block we want to replace starts right after:
// {isAdmin && exams.filter(e => e.paperTypeId === selectedPaperTypeId).length > 0 && (
//   <div className="flex justify-end mb-6">
//     <button onClick={... Clear All ... } ... >
//       ...
//     </button>
//   </div>
// )}
// <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// ...
// </div>
// {exams.filter(e => e.paperTypeId === selectedPaperTypeId).length === 0 && !searchQuery && (
// ...
// )}

const searchString = '{isAdmin && exams.filter(e => e.paperTypeId === selectedPaperTypeId).length > 0 && (';
const searchIdx = content.indexOf(searchString);

if (searchIdx > -1) {
    const gridStart = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">', searchIdx);
    if (gridStart > -1) {
        const gridEndMatch = content.substring(gridStart).match(/<\/AnimatePresence>\s*<\/div>/);
        if (gridEndMatch) {
             const endIndex = gridStart + gridEndMatch.index + gridEndMatch[0].length;
             
             let finalEndIndex = endIndex;
             const emptyStateStart = '{exams.filter(e => e.paperTypeId === selectedPaperTypeId).length === 0 && !searchQuery && (';
             if (content.substring(endIndex).includes(emptyStateStart)) {
                 const emptyStateIdx = content.indexOf(emptyStateStart, endIndex);
                 // just find the end of the empty state
                 const emptyStateEndMatch = content.substring(emptyStateIdx).match(/<\/div>\s*\)\}/);
                 if (emptyStateEndMatch) {
                     finalEndIndex = emptyStateIdx + emptyStateEndMatch.index + emptyStateEndMatch[0].length;
                 }
             }

             const replacement = `
                        <PaperSchedulePreview
                          exams={exams.filter(exam => exam.paperTypeId === selectedPaperTypeId).filter(exam => {
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return exam.subject.toLowerCase().includes(q) ||
                                      (exam.invigilators && exam.invigilators.some(inv => inv.name.toLowerCase().includes(q) || inv.email.toLowerCase().includes(q)));
                          })}
                          classes={classesList}
                          isAdmin={isAdmin}
                          onEdit={(examId) => { setEditingExamId(examId); setIsExamFormOpen(true); }}
                          onDelete={(examId) => setDeleteConfirm({ type: 'exam', id: examId })}
                        />
             `;

             content = content.substring(0, gridStart) + replacement + content.substring(finalEndIndex);
             fs.writeFileSync('src/App.tsx', content);
             console.log("Successfully replaced the PAPERS grid.");
        }
    }
}
