import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');

// Replace TeacherRequest with ChatMessage
content = content.replace(/export interface TeacherRequest \{[\s\S]*?\}/, `export interface ChatMessage {
  id: string;
  text: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'admin' | 'user';
  receiverEmail: string;
  timestamp: string;
  readByAdmin: boolean;
  readByUser: boolean;
}`);

fs.writeFileSync('src/types.ts', content);
