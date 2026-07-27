import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Remove in-memory array
content = content.replace(
  "let emailLogs: { id: string, timestamp: string, teacherEmail: string, subject: string, status: 'success' | 'error', details?: string }[] = [];",
  ""
);

// Replace emailLogs.unshift with addDoc
content = content.replace(/emailLogs\.unshift\(\{([\s\S]*?)\}\);/g, "await addDoc(collection(db, \"logs\"), {$1});");

// Remove the slice
content = content.replace(
  "if (emailLogs.length > 50) emailLogs = emailLogs.slice(0, 50);",
  ""
);

// Replace /api/logs endpoint
const logsEndpointOld = `app.get("/api/logs", (req, res) => {
  res.json(emailLogs);
});`;

const logsEndpointNew = `app.get("/api/logs", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "logs"));
    let logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(logs.slice(0, 100));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});`;

content = content.replace(logsEndpointOld, logsEndpointNew);

fs.writeFileSync('server.ts', content);
