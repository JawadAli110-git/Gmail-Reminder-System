import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.delete\("\/api\/requests\/:id", authMiddleware, async \(req: any, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: e\.message \}\);\s*\/\/ Chatbot API/m;

const replacement = `app.delete("/api/requests/:id", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    await deleteDoc(doc(db, "requests", id));
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Chatbot API`;

content = content.replace(regex, replacement);
fs.writeFileSync('server.ts', content);
