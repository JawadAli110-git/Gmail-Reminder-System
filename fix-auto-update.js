import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const APP_VERSION = "v2.0";
const CHANGELOG_MESSAGE = `🎉 App Updated to Version ${APP_VERSION}!

What's New:
- Real-time automated update notifications
- Read receipts completely remove unread marks automatically
- App icon badges for unread messages (on supported devices)
- Major UI and UX refinements

Enjoy the update!`;

const autoUpdateLogic = `
const APP_VERSION = "${APP_VERSION}";
const CHANGELOG_MESSAGE = \`${CHANGELOG_MESSAGE}\`;

(async () => {
  try {
    const versionDoc = await getDoc(doc(db, "app_settings", "version"));
    let lastVersion = "v1.0";
    if (versionDoc.exists()) {
      lastVersion = versionDoc.data().currentVersion;
    }
    
    if (lastVersion !== APP_VERSION) {
      console.log(\`Upgrading from \${lastVersion} to \${APP_VERSION}, broadcasting update...\`);
      
      const usersRef = collection(db, "users");
      const q = await getDocs(usersRef);
      const userEmails = q.docs.map(d => d.data().email);
      
      const now = new Date().toISOString();
      
      for (const email of userEmails) {
          const msgData = {
            text: CHANGELOG_MESSAGE,
            senderEmail: 'admin@example.com',
            senderName: 'Admin (System)',
            senderRole: 'admin',
            receiverEmail: email,
            timestamp: now,
            readByAdmin: true,
            readByUser: false
          };
          await addDoc(collection(db, "messages"), msgData);
      }
      
      await setDoc(doc(db, "app_settings", "version"), { currentVersion: APP_VERSION });
      console.log("Broadcast complete.");
    }
  } catch (err) {
    console.error("Failed to run version update broadcast:", err);
  }
})();
`;

content = content.replace(
  /const db = getFirestore\(firebaseApp, firebaseConfig\.firestoreDatabaseId\);/,
  `const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);\n\n${autoUpdateLogic}`
);

fs.writeFileSync('server.ts', content);
