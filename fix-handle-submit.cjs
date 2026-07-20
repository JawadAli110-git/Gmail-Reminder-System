const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

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
        setFormData({ days: ["Daily"] });
        setEditingId(null);
        showToast("Success", editingId ? "Class updated." : "Class added.", "success");
        await fetchEntries();
      }
    } catch (err) {
      triggerHapticError();
      console.error(err);
      showToast("Error", "Network error.", "error");
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
        setFormData({ days: ["Daily"] });
        setAdditionalSessions([]);
        setEditingId(null);
        showToast("Success", editingId ? "Class updated." : "Class added.", "success");
        await fetchEntries();
      }
    } catch (err) {
      triggerHapticError();
      console.error(err);
      showToast("Error", "Network error.", "error");
    } finally {
      setIsSubmittingEntry(false);
    }
  };`;

content = content.replace(oldHandleSubmit, newHandleSubmit);
fs.writeFileSync('src/App.tsx', content);
