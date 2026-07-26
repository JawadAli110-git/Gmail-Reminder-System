import fsSync from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import path from "path";

const firebaseConfig = JSON.parse(fsSync.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function run() {
  await updateDoc(doc(db, "settings", "adminAuth"), {
    email: "jawadali.syed.110@gmail.com"
  });
  console.log("Database updated");
  process.exit(0);
}
run();
