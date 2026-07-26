import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const apiString = `
app.get("/api/paper-types", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "paperTypes"));
    const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(types);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch paper types" });
  }
});

app.post("/api/paper-types", async (req, res) => {
  try {
    const data = req.body;
    if (data.id) {
      await setDoc(doc(db, "paperTypes", data.id), data);
    } else {
      await addDoc(collection(db, "paperTypes"), data);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to save paper type" });
  }
});

app.delete("/api/paper-types/:id", async (req, res) => {
  try {
    await deleteDoc(doc(db, "paperTypes", req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete paper type" });
  }
});
`;

content = content.replace('app.get("/api/classes",', apiString + '\napp.get("/api/classes",');
fs.writeFileSync('server.ts', content);
