import fsSync from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import path from "path";
import crypto from "crypto";

const firebaseConfig = JSON.parse(fsSync.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function run() {
  await updateDoc(doc(db, "settings", "adminAuth"), {
    password: crypto.createHash('sha256').update('admin123').digest('hex')
  });
  console.log("Database updated password to admin123");
  process.exit(0);
}
run();
