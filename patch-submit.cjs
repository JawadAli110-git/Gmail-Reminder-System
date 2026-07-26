const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldSubmitBlock = `      } else {
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
    } catch (err) {`;

const newSubmitBlock = `      } else {
        const submittedOptions: ConcurrentOption[] = [];
        if (formData.days && formData.days.length > 0 && formData.time) {
          submittedOptions.push({ day: formData.days[0], time: formData.time, endTime: formData.endTime });
        }
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
               } else {
                   submittedOptions.push({ day: session.day, time: session.time, endTime: session.endTime });
               }
            }
        }

        triggerHapticSuccess();
        await fetchEntries();
        if (!editingId && submittedOptions.length > 0) {
           setConcurrentOptions(submittedOptions);
           setShowConcurrentPrompt(true);
           setIsFormOpen(false);
           setFormData({ days: ["Daily"] });
           setAdditionalSessions([]);
        } else {
           setIsFormOpen(false);
           setFormData({ days: ["Daily"] });
           setAdditionalSessions([]);
           setEditingId(null);
           showToast("Success", editingId ? "Class updated." : "Class added.", "success");
        }
      }
    } catch (err) {`;

content = content.replace(oldSubmitBlock, newSubmitBlock);

const concurrentSubmitLogic = `  const handleConcurrentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEntry) return;

    const selectedOption = concurrentOptions.find(o => o.day === selectedConcurrentDay);
    if (!selectedOption) return;

    const submissionData = {
      ...concurrentFormData,
      classId: selectedClassId,
      days: [selectedOption.day],
      time: selectedOption.time,
      endTime: selectedOption.endTime,
      id: Date.now().toString()
    };

    setIsSubmittingEntry(true);
    triggerHaptic();

    try {
      const res = await fetch("/api/timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
      });
      const result = await res.json();
      if (!res.ok) {
         showToast("Scheduling Conflict", result.error || "Failed to schedule concurrent class.", "error");
         triggerHapticError();
      } else {
         triggerHapticSuccess();
         await fetchEntries();
         setShowConcurrentForm(false);
         setShowConcurrentPrompt(true); 
         setConcurrentFormData({});
      }
    } catch (err) {
      triggerHapticError();
      console.error(err);
      showToast("Error", "Network error.", "error");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleDeleteClick =`;

content = content.replace("  const handleDeleteClick =", concurrentSubmitLogic);

fs.writeFileSync('src/App.tsx', content);
