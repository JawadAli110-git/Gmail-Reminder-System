export interface TimetableEntry {
  id: string;
  teacherName: string;
  subject: string;
  time: string;
  endTime?: string;
  teacherEmail: string;
  days: string[];
  grade?: string;
  classId: string;
  room?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  teacherEmail: string;
  subject: string;
  status: 'success' | 'error';
  details?: string;
}

export interface Invigilator {
  name: string;
  email: string;
}

export interface ExamEntry {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime?: string;
  classId?: string;
  invigilators: Invigilator[];
}

