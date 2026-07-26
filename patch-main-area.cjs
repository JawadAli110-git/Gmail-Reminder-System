const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Disable drag and drop on FullCalendar
content = content.replace(
  'editable={true}\n                  droppable={true}',
  'editable={isAdmin}\n                  droppable={isAdmin}'
);

// 2. Hide Clear All / Add Entry buttons
const addEntryBlock = `{selectedClassId ? (
              <div className="flex gap-2 ml-auto md:ml-0">
                <button`;
const newAddEntryBlock = `{selectedClassId && isAdmin ? (
              <div className="flex gap-2 ml-auto md:ml-0">
                <button`;
content = content.replace(addEntryBlock, newAddEntryBlock);

// 3. Hide Event Edit/Delete buttons (custom render in FullCalendar)
// Find eventContent
const eventContentTarget = `const isExam = arg.event.extendedProps.type === 'exam';`;
const newEventContentTarget = `const isExam = arg.event.extendedProps.type === 'exam';
      const showActions = isAdmin;`;
content = content.replace(eventContentTarget, newEventContentTarget);

const eventActionsTarget = `<div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">`;
const newEventActionsTarget = `{showActions && <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">`;
content = content.replace(eventActionsTarget, newEventActionsTarget);

const endEventActionsTarget = `</button>
          </div>`;
const newEndEventActionsTarget = `</button>
          </div>}`;
content = content.replace(endEventActionsTarget, newEndEventActionsTarget);

// 4. Hide "Add Scheduled Paper" button
const addExamBtn = `<button
                    onClick={() => {
                      triggerHaptic();
                      setEditingExamId(null);
                      setExamFormData({ invigilators: [] });
                      setIsExamFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg ml-auto md:ml-0"
                  >`;
const newAddExamBtn = `{isAdmin && <button
                    onClick={() => {
                      triggerHaptic();
                      setEditingExamId(null);
                      setExamFormData({ invigilators: [] });
                      setIsExamFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg ml-auto md:ml-0"
                  >`;
content = content.replace(addExamBtn, newAddExamBtn);
content = content.replace(
  '<Plus size={18} />\n                    <span className="hidden sm:inline">Add Scheduled Paper</span>\n                  </button>',
  '<Plus size={18} />\n                    <span className="hidden sm:inline">Add Scheduled Paper</span>\n                  </button>}'
);

// 5. Hide Global Exams Delete All button
const globalExamsClearBtn = `<button
                        onClick={() => {
                          triggerHaptic();
                          setDeleteConfirm({ type: 'allGlobalExams', id: 'global' });
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg w-fit"
                        title="Delete All Scheduled Papers"
                      >`;
const newGlobalExamsClearBtn = `{isAdmin && <button
                        onClick={() => {
                          triggerHaptic();
                          setDeleteConfirm({ type: 'allGlobalExams', id: 'global' });
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg w-fit"
                        title="Delete All Scheduled Papers"
                      >`;
content = content.replace(globalExamsClearBtn, newGlobalExamsClearBtn);
content = content.replace(
  '<Trash2 size={18} />\n                        <span className="hidden sm:inline">Clear All</span>\n                      </button>',
  '<Trash2 size={18} />\n                        <span className="hidden sm:inline">Clear All</span>\n                      </button>}'
);

// 6. Hide Global Exams card edit/delete buttons
const globalCardActions = `<div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();`;
const newGlobalCardActions = `{isAdmin && <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();`;
content = content.replace(globalCardActions, newGlobalCardActions);
// Let's use string replace for the end of globalCardActions
const endGlobalCardActions = `</button>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">`;
const newEndGlobalCardActions = `</button>
                              </div>}
                            </div>
                            <h3 className="text-xl font-bold mb-2">`;
content = content.replace(endGlobalCardActions, newEndGlobalCardActions);

fs.writeFileSync('src/App.tsx', content);
