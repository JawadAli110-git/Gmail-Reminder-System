const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `app.post("/api/auth/reset-password", async (req, res) => {
   const { username, code, newPassword } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists()) {
       const data = adminDoc.data();
       if (data.username === username && data.resetCode === code && data.resetExpiry > Date.now()) {`;

const replaceStr = `app.post("/api/auth/reset-password", async (req, res) => {
   const { username, code, newPassword } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists()) {
       const data = adminDoc.data();
       if ((data.username === username || data.email === username) && data.resetCode === code && data.resetExpiry > Date.now()) {`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', content);
