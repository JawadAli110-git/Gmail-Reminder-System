import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const regex = /\/\/ Requests API[\s\S]*?app\.delete\("\/api\/requests\/:id", authMiddleware, async \(req: any, res\) => \{[\s\S]*?\}\);\n/m;

const newAPI = `// Messages API
app.get("/api/messages", authMiddleware, async (req: any, res) => {
  try {
    const snap = await getDocs(collection(db, "messages"));
    let messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (req.user.role === 'user') {
      messages = messages.filter((m: any) => m.senderEmail === req.user.email || m.receiverEmail === req.user.email);
    }
    messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    res.json(messages);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/messages", authMiddleware, async (req: any, res) => {
  try {
    const { text, receiverEmail } = req.body;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Check rate limit for user
    if (req.user.role === 'user') {
      const snap = await getDocs(collection(db, "messages"));
      const userMsgsToday = snap.docs.filter(d => {
        const data = d.data();
        return data.senderEmail === req.user.email && data.timestamp.startsWith(todayStr);
      });
      if (userMsgsToday.length >= 15) {
        return res.status(429).json({ error: "Daily message limit (15) reached." });
      }
    }

    const usersRef = collection(db, "users");
    const q = await getDocs(usersRef);
    const userDoc = q.docs.find(d => d.data().email === req.user.email);
    const senderName = req.user.role === 'admin' ? 'Admin' : (userDoc ? userDoc.data().name : 'Unknown User');

    const msgData = {
      text,
      senderEmail: req.user.email,
      senderName,
      senderRole: req.user.role,
      receiverEmail: req.user.role === 'admin' ? receiverEmail : 'admin',
      timestamp: now.toISOString(),
      readByAdmin: req.user.role === 'admin',
      readByUser: req.user.role === 'user'
    };

    const docRef = await addDoc(collection(db, "messages"), msgData);
    res.json({ success: true, id: docRef.id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/messages/read", authMiddleware, async (req: any, res) => {
  try {
    const { otherUserEmail } = req.body;
    const snap = await getDocs(collection(db, "messages"));
    
    for (const d of snap.docs) {
      const data = d.data();
      if (req.user.role === 'admin') {
        if (data.senderEmail === otherUserEmail && !data.readByAdmin) {
          await updateDoc(doc(db, "messages", d.id), { readByAdmin: true });
        }
      } else {
        if (data.senderRole === 'admin' && data.receiverEmail === req.user.email && !data.readByUser) {
          await updateDoc(doc(db, "messages", d.id), { readByUser: true });
        }
      }
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Daily Cron Job for Message Cleanup
cron.schedule("0 0 * * *", async () => {
  try {
    const snap = await getDocs(collection(db, "messages"));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    console.log("Daily messages cleanup completed.");
  } catch (err) {
    console.error("Failed to clean up messages:", err);
  }
});

`;

content = content.replace(regex, newAPI);
fs.writeFileSync('server.ts', content);
