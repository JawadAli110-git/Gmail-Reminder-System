import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Global error handler for express
const globalErrorHandler = `
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Express Global Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

async function startServer() {`;
content = content.replace('async function startServer() {', globalErrorHandler);

fs.writeFileSync('server.ts', content);
