import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Admin token should have role: 'admin' and email
content = content.replace(
    /const token = jwt\.sign\(\{ username \}, JWT_SECRET, \{ expiresIn: "365d" \}\);/g,
    `const token = jwt.sign({ username, role: 'admin', email: data.email || 'admin@example.com' }, JWT_SECRET, { expiresIn: "365d" });`
);

// Add verification sending for registration
const verificationCodeAPI = `
app.post("/api/users/send-verification", async (req, res) => {
   try {
       const { email } = req.body;
       if (!email) return res.status(400).json({ error: "Email is required" });
       
       const usersRef = collection(db, "users");
       const q = await getDocs(usersRef);
       const existing = q.docs.find(d => d.data().email === email);
       if (existing) return res.status(400).json({ error: "Email already registered" });
       
       const code = Math.floor(100000 + Math.random() * 900000).toString();
       await setDoc(doc(db, "verificationCodes", email), {
           code,
           createdAt: new Date().toISOString()
       });
       
       await transporter.sendMail({
           from: process.env.EMAIL_USER || "noreply@example.com",
           to: email,
           subject: "Your Registration Verification Code",
           text: \`Your verification code is: \${code}\`
       });
       
       res.json({ success: true });
   } catch (e: any) {
       res.status(500).json({ error: e.message });
   }
});
`;

content = content.replace(
    /app\.post\("\/api\/users\/register"/,
    verificationCodeAPI + '\napp.post("/api/users/register"'
);

// Update registration to check code
content = content.replace(
    /const { name, email, password } = req\.body;\n\s*if \(\!name \|\| \!email \|\| \!password\) return res\.status\(400\)\.json\(\{ error: "All fields are required" \}\);/g,
    `const { name, email, password, code } = req.body;
       if (!name || !email || !password || !code) return res.status(400).json({ error: "All fields are required" });
       
       const codeDoc = await getDoc(doc(db, "verificationCodes", email));
       if (!codeDoc.exists() || codeDoc.data().code !== code) {
           return res.status(400).json({ error: "Invalid verification code" });
       }`
);

fs.writeFileSync('server.ts', content);
