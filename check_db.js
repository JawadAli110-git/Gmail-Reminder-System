import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

(async () => {
    const vDoc = await getDoc(doc(db, "app_settings", "version"));
    console.log("Version in DB:", vDoc.exists() ? vDoc.data() : "none");
    
    const messages = await getDocs(collection(db, "messages"));
    console.log("Total messages:", messages.size);
    let broadcastCount = 0;
    messages.forEach(m => {
        if (m.data().text && m.data().text.includes("App Updated")) {
            broadcastCount++;
        }
    });
    console.log("Broadcast messages found:", broadcastCount);
    process.exit(0);
})();
