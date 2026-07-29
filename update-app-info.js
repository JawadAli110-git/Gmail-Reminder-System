import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const newAppInfo = `
app.get("/api/app-info", (req, res) => {
  res.json({
    version: APP_VERSION,
    changelog: "🎉 Recent User Features:\\n- Real-time automated update notifications\\n- Automated daily email logs cleanup to keep logs fresh\\n- AI Assistant improvements for better scheduling\\n- Badges for unread messages\\n- UI & UX Refinements",
    description: "Welcome to Acadamus! This platform provides multiple features for your ease:\\n\\n🤖 AI Assistant: A smart chatbot to help you query timetables, find specific classes, and answer general questions instantly.\\n\\n💬 Chat (Messages): A direct line to communicate with the administration for any requests or issues.\\n\\n📅 Schedule Check (Classes): View your daily timetable and keep track of your classes effortlessly.\\n\\n📄 Paper Check (Exams): Stay updated on your upcoming exams and assignments.\\n\\n📊 Dashboard: A quick overview of your activities and important metrics."
  });
});
`;

content = content.replace(
  /app\.get\("\/api\/app-info"[\s\S]*?\}\);/,
  newAppInfo.trim()
);

fs.writeFileSync('server.ts', content);
