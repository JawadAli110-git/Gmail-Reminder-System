import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'app.put("/api/exams/:id", authMiddleware, async (req, res) => {',
  `app.put("/api/exams/:id", authMiddleware, async (req, res) => {
  try {`
);

content = content.replace(
  'await updateDoc(doc(db, "exams", id), updateData);\n  res.json({ success: true });\n});',
  `await updateDoc(doc(db, "exams", id), updateData);\n  res.json({ success: true });\n  } catch (error: any) {\n    console.error("Error in PUT /api/exams/:id :", error);\n    res.status(500).json({ error: "Server error during update: " + error.message });\n  }\n});`
);

fs.writeFileSync('server.ts', content);
