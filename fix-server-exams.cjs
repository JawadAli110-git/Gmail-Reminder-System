const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const endpoint = `
app.delete("/api/exams/all", async (req, res) => {
  try {
    const examsSnap = await getDocs(collection(db, "exams"));
    for (const doc of examsSnap.docs) {
      await deleteDoc(doc.ref);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

content = content.replace(
  /app\.delete\("\/api\/exams\/:id",/,
  endpoint + '\napp.delete("/api/exams/:id",'
);

fs.writeFileSync('server.ts', content);
