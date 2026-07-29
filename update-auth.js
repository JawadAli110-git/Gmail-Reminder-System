import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const userAuthEndpoints = `
// User Auth Endpoints
app.post("/api/users/register", async (req, res) => {
   try {
       const { name, email, password } = req.body;
       if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
       
       const usersRef = collection(db, "users");
       const q = await getDocs(usersRef);
       const existing = q.docs.find(d => d.data().email === email);
       if (existing) return res.status(400).json({ error: "Email already registered" });

       const hashedPassword = hashPassword(password);
       await addDoc(usersRef, {
           name,
           email,
           password: hashedPassword,
           createdAt: new Date().toISOString()
       });
       
       const token = jwt.sign({ email, role: 'user' }, JWT_SECRET, { expiresIn: "24h" });
       res.json({ success: true, token, user: { name, email } });
   } catch (e: any) {
       res.status(500).json({ error: e.message });
   }
});

app.post("/api/users/login", async (req, res) => {
   try {
       const { email, password } = req.body;
       const usersRef = collection(db, "users");
       const q = await getDocs(usersRef);
       const userDoc = q.docs.find(d => d.data().email === email && d.data().password === hashPassword(password));
       
       if (userDoc) {
           const token = jwt.sign({ email, role: 'user' }, JWT_SECRET, { expiresIn: "24h" });
           res.json({ success: true, token, user: { name: userDoc.data().name, email: userDoc.data().email } });
       } else {
           res.status(401).json({ error: "Invalid credentials" });
       }
   } catch (e: any) {
       res.status(500).json({ error: e.message });
   }
});

app.post("/api/users/forgot-password", async (req, res) => {
   try {
       const { email } = req.body;
       const usersRef = collection(db, "users");
       const q = await getDocs(usersRef);
       const userDoc = q.docs.find(d => d.data().email === email);
       
       if (userDoc) {
           const code = Math.floor(100000 + Math.random() * 900000).toString();
           await updateDoc(doc(db, "users", userDoc.id), { resetCode: code, resetCodeExpiry: Date.now() + 15 * 60 * 1000 });
           
           if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
               await transporter.sendMail({
                   from: process.env.EMAIL_USER,
                   to: email,
                   subject: "Password Reset Code",
                   text: \`Your password reset code is: \${code}. It will expire in 15 minutes.\`
               });
           }
           res.json({ success: true });
       } else {
           res.status(404).json({ error: "User not found" });
       }
   } catch (e: any) {
       res.status(500).json({ error: e.message });
   }
});

app.post("/api/users/reset-password", async (req, res) => {
   try {
       const { email, code, newPassword } = req.body;
       const usersRef = collection(db, "users");
       const q = await getDocs(usersRef);
       const userDoc = q.docs.find(d => d.data().email === email);
       
       if (userDoc) {
           const data = userDoc.data();
           if (data.resetCode === code && data.resetCodeExpiry && data.resetCodeExpiry > Date.now()) {
               await updateDoc(doc(db, "users", userDoc.id), {
                   password: hashPassword(newPassword),
                   resetCode: null,
                   resetCodeExpiry: null
               });
               res.json({ success: true });
           } else {
               res.status(400).json({ error: "Invalid or expired code" });
           }
       } else {
           res.status(404).json({ error: "User not found" });
       }
   } catch (e: any) {
       res.status(500).json({ error: e.message });
   }
});

`;

content = content.replace(
  'app.get("/api/logs", async (req, res) => {',
  userAuthEndpoints + 'app.get("/api/logs", async (req, res) => {'
);

fs.writeFileSync('server.ts', content);
