const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const endpoint = `
app.delete("/api/classes/:id/records", async (req, res) => {
  const { id } = req.params;
  try {
    // Delete all timetable entries for this class
    const timetableSnap = await getDocs(collection(db, "timetable"));
    const timetableDocs = timetableSnap.docs.filter(d => d.data().classId === id);
    for (const doc of timetableDocs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete all exams for this class
    const examsSnap = await getDocs(collection(db, "exams"));
    const examsDocs = examsSnap.docs.filter(d => d.data().classId === id);
    for (const doc of examsDocs) {
      await deleteDoc(doc.ref);
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

content = content.replace(
  /app\.delete\("\/api\/classes\/:id",/,
  endpoint + '\napp.delete("/api/classes/:id",'
);

fs.writeFileSync('server.ts', content);
