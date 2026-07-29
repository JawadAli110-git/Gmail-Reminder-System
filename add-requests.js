import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const requestsEndpoints = `
// Requests API
app.get("/api/requests", authMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "requests"));
    let requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    requests.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(requests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

app.post("/api/requests", async (req, res) => {
  try {
    const requestData = req.body;
    requestData.timestamp = new Date().toISOString();
    requestData.status = 'pending';
    const docRef = await addDoc(collection(db, "requests"), requestData);
    res.json({ success: true, id: docRef.id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/requests/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reply, email, name, type } = req.body;
    await updateDoc(doc(db, "requests", id), { status, reply });
    
    if (email && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      try {
         const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: \`Update on your request: \${type}\`,
            text: \`Dear \${name},\n\nYour request has been \${status}.\n\nAdmin Reply: \${reply || (status === 'approved' ? 'Request approved.' : 'Request disapproved.')}\n\nBest regards,\nAdmin System\`,
          };
          await transporter.sendMail(mailOptions);
          await addDoc(collection(db, "logs"), {
            timestamp: new Date().toISOString(),
            teacherEmail: email,
            subject: \`Request Reply - \${type}\`,
            status: 'success'
          });
      } catch (err: any) {
          await addDoc(collection(db, "logs"), {
            timestamp: new Date().toISOString(),
            teacherEmail: email,
            subject: \`Request Reply - \${type}\`,
            status: 'error',
            details: err.message
          });
      }
    }

    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/requests/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDoc(doc(db, "requests", id));
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

`;

content = content.replace('// Chatbot API', requestsEndpoints + '// Chatbot API');

fs.writeFileSync('server.ts', content);
