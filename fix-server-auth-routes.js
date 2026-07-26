import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

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
  content = content.replace(route + ' async', route + ' authMiddleware, async');
}

fs.writeFileSync('server.ts', content);
