import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const appInfoEndpoint = `
app.get("/api/app-info", (req, res) => {
  res.json({
    version: APP_VERSION,
    changelog: CHANGELOG_MESSAGE,
    description: "Welcome to our application! This platform provides tools for managing your schedules, communicating with the administration, and staying up-to-date with your classes. The Dashboard gives you a quick overview, Classes lets you view schedules, and Chat allows you to reach out directly to the admin."
  });
});
`;

content = content.replace(
  /const now = new Date\(\)\.toISOString\(\);\s*for \(const email of userEmails\) \{/g,
  `const now = new Date().toISOString();
      
      for (const email of userEmails) {
          if (email === 'admin@example.com' || email === 'jawadali.syed.110@gmail.com') continue; // Skip admin`
);

content = content.replace(
  /app\.get\("\/api\/messages",/g,
  appInfoEndpoint + '\napp.get("/api/messages",'
);

fs.writeFileSync('server.ts', content);
