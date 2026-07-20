const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state variable
content = content.replace(
  /const \[formData, setFormData\] = useState<Partial<TimetableEntry>>\(\{ days: \["Daily"\] \}\);/,
  `const [formData, setFormData] = useState<Partial<TimetableEntry>>({ days: ["Daily"] });\n  const [additionalSessions, setAdditionalSessions] = useState<{day: string, time: string, endTime?: string}[]>([]);`
);

// 2. Update handleEdit to clear sessions
content = content.replace(
  /const handleEdit = \(entry: TimetableEntry\) => \{\n\s*triggerHaptic\(\);\n\s*setFormData\(entry\);\n\s*setEditingId\(entry\.id\);\n\s*setIsFormOpen\(true\);\n\s*\};/,
  `const handleEdit = (entry: TimetableEntry) => {
    triggerHaptic();
    setFormData(entry);
    setEditingId(entry.id);
    setAdditionalSessions([]);
    setIsFormOpen(true);
  };`
);

// 3. Update the add button to clear sessions
content = content.replace(
  /setEditingId\(null\);\n\s*setFormData\(\{\}\);\n\s*setIsFormOpen\(true\);/,
  `setEditingId(null);\n                  setFormData({});\n                  setAdditionalSessions([]);\n                  setIsFormOpen(true);`
);

// 4. Update handleSubmit
const oldHandleSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEntry) return;
    
    const url = editingId ? \`/api/timetable/\${editingId}\` : "/api/timetable";
    const method = editingId ? "PUT" : "POST";
    const submissionData = { 
      ...formData,
      classId: selectedClassId,
      id: editingId || Date.now().toString()
    };
    
    setIsSubmittingEntry(true);
    triggerHaptic();
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const result = await res.json();
      
      if (!res.ok) {
        showToast("Scheduling Conflict", result.error || "Failed to schedule class.", "error");
        triggerHapticError();
      } else {
        triggerHapticSuccess();
        setIsFormOpen(false);
        setEditingId(null);
        showToast("Success", editingId ? "Entry updated successfully." : "Entry added successfully.", "success");
        await fetchEntries();
      }
    } catch (err) {
      triggerHapticError();
    } finally {
      setIsSubmittingEntry(false);
    }
  };`;

const newHandleSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEntry) return;
    
    const url = editingId ? \`/api/timetable/\${editingId}\` : "/api/timetable";
    const method = editingId ? "PUT" : "POST";
    const submissionData = { 
      ...formData,
      classId: selectedClassId,
      id: editingId || Date.now().toString()
    };
    
    setIsSubmittingEntry(true);
    triggerHaptic();
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const result = await res.json();
      
      if (!res.ok) {
        showToast("Scheduling Conflict", result.error || "Failed to schedule class.", "error");
        triggerHapticError();
      } else {
        if (!editingId && additionalSessions.length > 0) {
            for (const session of additionalSessions) {
               if (!session.time) continue;
               const sessionData = {
                  ...formData,
                  classId: selectedClassId,
                  id: Date.now().toString() + Math.random().toString(),
                  days: [session.day],
                  time: session.time,
                  endTime: session.endTime
               };
               const sessionRes = await fetch("/api/timetable", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(sessionData)
               });
               const sessionResult = await sessionRes.json();
               if (!sessionRes.ok) {
                   showToast("Scheduling Conflict", \`Failed to schedule extra class on \${session.day}. \${sessionResult.error}\`, "error");
               }
            }
        }
        
        triggerHapticSuccess();
        setIsFormOpen(false);
        setEditingId(null);
        setAdditionalSessions([]);
        showToast("Success", editingId ? "Entry updated successfully." : "Entry added successfully.", "success");
        await fetchEntries();
      }
    } catch (err) {
      triggerHapticError();
    } finally {
      setIsSubmittingEntry(false);
    }
  };`;

content = content.replace(oldHandleSubmit, newHandleSubmit);

// 5. Add the UI below the time inputs
const oldTimeUI = `</div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">End Time</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="time"
                          value={formData.endTime || ""} onChange={e => setFormData({...formData, endTime: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>`;

const newTimeUI = `</div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">End Time</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="time"
                          value={formData.endTime || ""} onChange={e => setFormData({...formData, endTime: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Sessions */}
                  {!editingId && additionalSessions.map((session, index) => (
                    <div key={index} className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 relative">
                      <button 
                        type="button" 
                        onClick={() => {
                          const newSessions = [...additionalSessions];
                          newSessions.splice(index, 1);
                          setAdditionalSessions(newSessions);
                        }}
                        className="absolute right-0 top-4 text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Additional Schedule {index + 1}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Day</label>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                              required
                              value={session.day}
                              onChange={e => {
                                const newSessions = [...additionalSessions];
                                newSessions[index].day = e.target.value;
                                setAdditionalSessions(newSessions);
                              }}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white appearance-none"
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Start Time</label>
                          <div className="relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              required type="time"
                              value={session.time}
                              onChange={e => {
                                const newSessions = [...additionalSessions];
                                newSessions[index].time = e.target.value;
                                setAdditionalSessions(newSessions);
                              }}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">End Time</label>
                          <div className="relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="time"
                              value={session.endTime || ""}
                              onChange={e => {
                                const newSessions = [...additionalSessions];
                                newSessions[index].endTime = e.target.value;
                                setAdditionalSessions(newSessions);
                              }}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!editingId && (
                    <button
                      type="button"
                      onClick={() => setAdditionalSessions([...additionalSessions, { day: "Monday", time: "" }])}
                      className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <Plus size={16} /> Add another day/time for this class
                    </button>
                  )}
                </div>`;

content = content.replace(oldTimeUI, newTimeUI);

fs.writeFileSync('src/App.tsx', content);
