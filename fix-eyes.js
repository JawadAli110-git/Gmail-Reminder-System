import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText, Search, Lock, LogIn, KeyRound, LogOut } from "lucide-react";',
  'import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText, Search, Lock, LogIn, KeyRound, LogOut, Eye, EyeOff } from "lucide-react";'
);

content = content.replace(
  "const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset'>('login');",
  "const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset'>('login');\n  const [showPassword, setShowPassword] = useState(false);\n  const [showNewPassword, setShowNewPassword] = useState(false);\n  const [showConfirmPassword, setShowConfirmPassword] = useState(false);"
);

fs.writeFileSync('src/App.tsx', content);
