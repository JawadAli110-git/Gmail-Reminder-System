import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const newChangelogMsg = `const CHANGELOG_MESSAGE = \`🎉 App Updated to Version \${APP_VERSION}!

What's New (User Features):
- Real-time automated update notifications
- AI Assistant improvements for better scheduling
- Read receipts completely remove unread marks automatically
- App icon badges for unread messages (on supported devices)
- Major UI and UX refinements

Enjoy the update!\`;`;

content = content.replace(
  /const CHANGELOG_MESSAGE = `[\s\S]*?Enjoy the update!`;/,
  newChangelogMsg
);

fs.writeFileSync('server.ts', content);
