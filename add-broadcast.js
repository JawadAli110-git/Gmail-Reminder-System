import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const broadcastAPI = `
app.post("/api/messages/broadcast", authMiddleware, async (req: any, res) => {
  try {
    const { text } = req.body;
    const userRole = req.user.role || (req.user.username ? 'admin' : 'user');
    if (userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    
    const now = new Date();
    
    // Get all unique users
    const usersRef = collection(db, "users");
    const q = await getDocs(usersRef);
    const userEmails = q.docs.map(d => d.data().email);
    
    for (const email of userEmails) {
        const msgData = {
          text,
          senderEmail: 'admin@example.com',
          senderName: 'Admin (Broadcast)',
          senderRole: 'admin',
          receiverEmail: email,
          timestamp: now.toISOString(),
          readByAdmin: true,
          readByUser: false
        };
        await addDoc(collection(db, "messages"), msgData);
    }
    
    res.json({ success: true, count: userEmails.length });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
`;

content = content.replace(
    /app\.post\("\/api\/messages", authMiddleware, async \(req: any, res\) => \{/,
    broadcastAPI + '\napp.post("/api/messages", authMiddleware, async (req: any, res) => {'
);

fs.writeFileSync('server.ts', content);
