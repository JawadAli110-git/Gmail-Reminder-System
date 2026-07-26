const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const crypto = require('crypto');

const authCode = `
import crypto from 'crypto';
import { getDoc } from 'firebase/firestore';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initAdmin() {
  const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
  if (!adminDoc.exists()) {
    await setDoc(doc(db, "settings", "adminAuth"), {
      username: "admin",
      password: hashPassword("admin123"),
      email: process.env.EMAIL_USER || "admin@example.com"
    });
  }
}
initAdmin();

app.post("/api/auth/login", async (req, res) => {
   const { username, password } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists()) {
      const data = adminDoc.data();
      if (data.username === username && data.password === hashPassword(password)) {
         return res.json({ success: true, token: "admin-token-xyz" });
      }
   }
   return res.status(401).json({ error: "Invalid credentials" });
});

app.post("/api/auth/forgot-password", async (req, res) => {
   const { username } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists() && adminDoc.data().username === username) {
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
});

app.post("/api/auth/reset-password", async (req, res) => {
   const { username, code, newPassword } = req.body;
   const adminDoc = await getDoc(doc(db, "settings", "adminAuth"));
   if (adminDoc.exists()) {
       const data = adminDoc.data();
       if (data.username === username && data.resetCode === code && data.resetExpiry > Date.now()) {
           await updateDoc(doc(db, "settings", "adminAuth"), {
               password: hashPassword(newPassword),
               resetCode: null,
               resetExpiry: null
           });
           return res.json({ success: true });
       }
   }
   return res.status(400).json({ error: "Invalid or expired code" });
});

// `

content = content.replace(
  'import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";',
  'import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";'
);

content = content.replace(
  'app.use(express.json());',
  'app.use(express.json());\n' + authCode
);

fs.writeFileSync('server.ts', content);
