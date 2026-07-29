import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const updatedLogs = `
app.get("/api/logs", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "logs"));
    let logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Only return logs for the current day
    const todayStr = new Date().toISOString().split('T')[0];
    logs = logs.filter((l: any) => l.timestamp && l.timestamp.startsWith(todayStr));
    
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(logs.slice(0, 100));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});
`;

content = content.replace(
  /app\.get\("\/api\/logs", async \(req, res\) => \{[\s\S]*?\}\);/m,
  updatedLogs.trim()
);

fs.writeFileSync('server.ts', content);
