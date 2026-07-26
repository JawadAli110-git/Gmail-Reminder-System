const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetForgot = `app.post("/api/auth/forgot-password", async (req, res) => {
   const { username } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists() && (adminDoc.data().username === username || adminDoc.data().email === username)) {
       const code = Math.floor(100000 + Math.random() * 900000).toString();
       await updateDoc(doc(db, "settings", "adminAuth"), {
          resetCode: code,
          resetExpiry: Date.now() + 15 * 60000
       });
       
       const adminEmail = adminDoc.data().email || process.env.EMAIL_USER;
       if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
          return res.status(500).json({ error: "Email provider not configured in server" });
       }

       try {
          await transporter.sendMail({
             from: process.env.EMAIL_USER,
             to: adminEmail,
             subject: "Password Reset Code",
             text: \`Your password reset code is: \${code}\`
          });
          return res.json({ success: true, email: adminEmail });
       } catch (error: any) {
          return res.status(500).json({ error: "Failed to send email: " + error.message });
       }
   }
   return res.status(404).json({ error: "User not found" });
});`;

const replaceForgot = `app.post("/api/auth/forgot-password", async (req, res) => {
   const { username } = req.body; // Actually treating this as email now
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   // Only check against email
   if (adminDoc.exists() && adminDoc.data().email === username) {
       const code = Math.floor(100000 + Math.random() * 900000).toString();
       await updateDoc(doc(db, "settings", "adminAuth"), {
          resetCode: code,
          resetExpiry: Date.now() + 15 * 60000
       });
       
       // Hardcoded recipient email as requested
       const recipientEmail = "jawadali.syed.110@gmail.com";
       if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
          return res.status(500).json({ error: "Email provider not configured in server" });
       }

       try {
          await transporter.sendMail({
             from: "re.acadamus@gmail.com",
             to: recipientEmail,
             subject: "Password Reset Code",
             text: \`Your password reset code is: \${code}\`
          });
          return res.json({ success: true, email: recipientEmail });
       } catch (error: any) {
          return res.status(500).json({ error: "Failed to send email: " + error.message });
       }
   }
   return res.status(404).json({ error: "Email not found. Please provide the correct admin email." });
});`;

const targetReset = `app.post("/api/auth/reset-password", async (req, res) => {
   const { username, code, newPassword } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists()) {
       const data = adminDoc.data();
       if ((data.username === username || data.email === username) && data.resetCode === code && data.resetExpiry > Date.now()) {`;

const replaceReset = `app.post("/api/auth/reset-password", async (req, res) => {
   const { username, code, newPassword } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists()) {
       const data = adminDoc.data();
       if (data.email === username && data.resetCode === code && data.resetExpiry > Date.now()) {`;

content = content.replace(targetForgot, replaceForgot).replace(targetReset, replaceReset);
fs.writeFileSync('server.ts', content);
