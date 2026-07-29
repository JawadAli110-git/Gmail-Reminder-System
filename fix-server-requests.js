import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Fix authMiddleware
const authMiddlewareOld = `const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};`;

const authMiddlewareNew = `const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};`;
content = content.replace(authMiddlewareOld, authMiddlewareNew);


// Fix requests endpoints
const requestsAPI = `
// Requests API
app.get("/api/requests", authMiddleware, async (req: any, res) => {
  try {
    const snap = await getDocs(collection(db, "requests"));
    let requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (req.user.role === 'user') {
      requests = requests.filter((r: any) => r.email === req.user.email);
    }
    requests.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(requests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

app.post("/api/requests", authMiddleware, async (req: any, res) => {
  try {
    const requestData = req.body;
    requestData.timestamp = new Date().toISOString();
    requestData.status = 'pending';
    requestData.email = req.user.email;
    requestData.readByUser = true;
    requestData.readByAdmin = false;
    
    const usersRef = collection(db, "users");
    const q = await getDocs(usersRef);
    const userDoc = q.docs.find(d => d.data().email === req.user.email);
    requestData.name = userDoc ? userDoc.data().name : 'Unknown User';

    const docRef = await addDoc(collection(db, "requests"), requestData);
    res.json({ success: true, id: docRef.id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/requests/:id", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, reply, email, name, type } = req.body;
    await updateDoc(doc(db, "requests", id), { status, reply, readByUser: false });
    
    // We remove the email sending logic since the prompt says:
    // "emails wali cheez hata do" (remove emails related thing)
    // and "admin k paas request approve ya deny krne ka option to ho lekin message send krne ka bhi ho matlab agr admin karo approve kar raha hai to uska msg chala jaye user tak"
    // So messages are internal to the app now! We don't send external emails.
    
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/requests/:id/read", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'user') {
       await updateDoc(doc(db, "requests", id), { readByUser: true });
    } else {
       await updateDoc(doc(db, "requests", id), { readByAdmin: true });
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/requests/:id", authMiddleware, async (req: any, res) => {
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

content = content.replace(/\/\/ Requests API[\s\S]*?app\.delete\("\/api\/requests\/:id", authMiddleware, async \(req, res\) => \{[\s\S]*?\}\);/m, requestsAPI.trim());

fs.writeFileSync('server.ts', content);
