import fsSync from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import path from "path";

const firebaseConfig = JSON.parse(fsSync.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function run() {
  const docSnap = await getDoc(doc(db, "settings", "adminAuth"));
  if (docSnap.exists()) {
    console.log("Admin Data:", JSON.stringify(docSnap.data(), null, 2));
  } else {
    console.log("No admin data found!");
  }
  process.exit(0);
}
run();
