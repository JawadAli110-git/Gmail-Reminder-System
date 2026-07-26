import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Add import jsonwebtoken
if (!content.includes('import jwt from "jsonwebtoken";')) {
  content = content.replace("import crypto from 'crypto';", "import crypto from 'crypto';\nimport jwt from \"jsonwebtoken\";");
}

// Add JWT secret
if (!content.includes('const JWT_SECRET')) {
  content = content.replace('const app = express();', 'const app = express();\nconst JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");');
}

// Update login token generation
content = content.replace(
  'return res.json({ success: true, token: "admin-token-xyz" });',
  'const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });\n         return res.json({ success: true, token });'
);

// Add auth middleware
const authMiddleware = `
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
`;

if (!content.includes('const authMiddleware')) {
  content = content.replace('app.get("/api/settings",', authMiddleware + '\napp.get("/api/settings",');
}

// Apply auth middleware to protected routes
const protectedRoutes = [
  'app.post("/api/settings",',
  'app.post("/api/paper-types",',
  'app.delete("/api/paper-types/:id",',
  'app.post("/api/classes",',
  'app.delete("/api/classes/:id/records",',
  'app.put("/api/classes/:id",',
  'app.delete("/api/classes/:id",',
  'app.post("/api/timetable",',
  'app.put("/api/timetable/:id",',
  'app.delete("/api/timetable/:id",',
  'app.post("/api/exams",',
  'app.put("/api/exams/:id",',
  'app.delete("/api/exams/all",',
  'app.delete("/api/exams/:id",',
  'app.post("/api/intelligence",'
];

for (const route of protectedRoutes) {
  content = content.replace(route, route.replace('", async', '", authMiddleware, async'));
}

fs.writeFileSync('server.ts', content);
