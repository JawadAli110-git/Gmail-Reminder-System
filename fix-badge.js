import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const badgeEffect = `
  useEffect(() => {
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      if (isAdmin) {
        const unreadCount = messages.filter((m: any) => !m.readByAdmin).length;
        if (unreadCount > 0) {
          (navigator as any).setAppBadge(unreadCount).catch(console.error);
        } else {
          (navigator as any).clearAppBadge().catch(console.error);
        }
      } else if (isUser) {
        const unreadCount = messages.filter((m: any) => !m.readByUser).length;
        if (unreadCount > 0) {
          (navigator as any).setAppBadge(unreadCount).catch(console.error);
        } else {
          (navigator as any).clearAppBadge().catch(console.error);
        }
      }
    }
  }, [messages, isAdmin, isUser]);
`;

content = content.replace(
  /const handleSendMessage = async \(e: React\.FormEvent\) => \{/,
  badgeEffect + '\n  const handleSendMessage = async (e: React.FormEvent) => {'
);

fs.writeFileSync('src/App.tsx', content);
