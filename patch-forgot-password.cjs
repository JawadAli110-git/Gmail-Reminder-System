const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `app.post("/api/auth/forgot-password", async (req, res) => {
   const { username } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists() && adminDoc.data().username === username) {`;

const replaceStr = `app.post("/api/auth/forgot-password", async (req, res) => {
   const { username } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists() && (adminDoc.data().username === username || adminDoc.data().email === username)) {`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', content);
