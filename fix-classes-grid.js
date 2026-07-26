import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const paperPreviewStr = `<PaperSchedulePreview
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
                        />`;

const originalClassesGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {classesList.filter(cls => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return cls.name.toLowerCase().includes(q) ||
                            entries.filter(e => e.classId === cls.id).some(e => e.subject.toLowerCase().includes(q) || e.teacherName.toLowerCase().includes(q));
                        }).length === 0 && searchQuery ? (
                          <div className="col-span-full text-center py-12 text-slate-500">
                            <Search className="mx-auto mb-3 opacity-50" size={32} />
                            <p className="text-lg">No classes found matching "{searchQuery}"</p>
                          </div>
                        ) : classesList.filter(cls => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return cls.name.toLowerCase().includes(q) ||
                            entries.filter(e => e.classId === cls.id).some(e => e.subject.toLowerCase().includes(q) || e.teacherName.toLowerCase().includes(q));
                        }).map((cls, idx) => (
                          <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => {
                              triggerHaptic();
                              setSelectedClassId(cls.id);
                            }}
                            className="liquid-glass rounded-3xl p-6 group relative overflow-hidden text-slate-900 dark:text-white cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <GraduationCap size={24} />
                              </div>
                              {isAdmin && <button 
                                onClick={(e) => handleDeleteClassClick(cls.id, e)} 
                                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={16} />
                              </button>}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{cls.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {entries.filter(e => e.classId === cls.id).length} scheduled sessions
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>`;

content = content.replace(paperPreviewStr, originalClassesGrid);
fs.writeFileSync('src/App.tsx', content);
