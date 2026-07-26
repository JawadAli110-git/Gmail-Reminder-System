import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace(
  'import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";',
  'import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc, addDoc } from "firebase/firestore";'
);
fs.writeFileSync('server.ts', content);
