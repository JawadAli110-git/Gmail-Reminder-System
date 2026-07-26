const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText } from "lucide-react";',
  'import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText, Search, Lock, LogIn, KeyRound } from "lucide-react";'
);

fs.writeFileSync('src/App.tsx', content);
