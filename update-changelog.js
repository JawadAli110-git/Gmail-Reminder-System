import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const newChangelog = `"🎉 Recent User Features:\\n- Real-time automated update notifications\\n- Automated daily email logs cleanup to keep logs fresh\\n- AI Assistant improvements for better scheduling & responsive UI\\n- Badges for unread messages\\n- Full responsive UI across devices & refined animations"`;

content = content.replace(
  /"🎉 Recent User Features:[^"]+"/,
  newChangelog
);

fs.writeFileSync('server.ts', content);
