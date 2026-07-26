import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startIndex = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');
// Find the end of this block. The block ends with:
//                             ))}
//                           </AnimatePresence>
//                         </div>
//                         {exams.filter(e => e.paperTypeId === selectedPaperTypeId).length === 0 && !searchQuery && (

const searchEnd = content.indexOf('{exams.filter(e => e.paperTypeId === selectedPaperTypeId).length === 0 && !searchQuery && (', startIndex);
const endOfGrid = searchEnd > -1 ? searchEnd : content.indexOf('</>', startIndex);

if (startIndex > -1) {
  const before = content.substring(0, startIndex);
  // Find the exact end. We know the grid div has a closing </div>.
  // We can just replace from startIndex up to the end of the AnimatePresence / grid block.
  // Actually, I'll use a regex that matches the whole div structure, or simply search for `</AnimatePresence>\n                        </div>`
  
  const endMarker = '</AnimatePresence>\\n                        </div>';
  const endRegex = new RegExp('</AnimatePresence>\\\\s*</div>');
  const match = content.substring(startIndex).match(/<\/AnimatePresence>\s*<\/div>/);
  if (match) {
     const endIndex = startIndex + match.index + match[0].length;
     
     // Also find the empty state if it exists
     let finalEndIndex = endIndex;
     const emptyStateStart = '{exams.filter(e => e.paperTypeId === selectedPaperTypeId).length === 0 && !searchQuery && (';
     if (content.substring(endIndex).includes(emptyStateStart)) {
         const emptyStateIdx = content.indexOf(emptyStateStart, endIndex);
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
     
     content = content.substring(0, startIndex) + replacement + content.substring(finalEndIndex);
     fs.writeFileSync('src/App.tsx', content);
     console.log("Successfully replaced grid with PaperSchedulePreview");
  } else {
     console.log("Could not find end of grid block");
  }
} else {
  console.log("Could not find start index");
}
