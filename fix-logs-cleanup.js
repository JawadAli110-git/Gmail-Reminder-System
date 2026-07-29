import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
    /console\.log\("Daily messages cleanup completed\."\);/,
    `console.log("Daily messages cleanup completed.");
    
    // Cleanup logs as well
    const logsSnap = await getDocs(collection(db, "logs"));
    for (const d of logsSnap.docs) {
      await deleteDoc(d.ref);
    }
    console.log("Daily email logs cleanup completed.");`
);

fs.writeFileSync('server.ts', content);
