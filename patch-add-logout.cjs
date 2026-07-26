const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText, Search, Lock, LogIn, KeyRound } from "lucide-react";',
  'import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText, Search, Lock, LogIn, KeyRound, LogOut } from "lucide-react";'
);

const logoutBtnStr = `{isAdmin && <button
              onClick={() => {
                triggerHaptic();
                setIsLogsOpen(true);
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Email Logs"
            >
              <Activity size={20} />
            </button>}
            {isAdmin && <button
              onClick={() => {
                triggerHaptic();
                setIsAdmin(false);
                showToast("Success", "Logged out successfully", "success");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0"
              title="Log Out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Log Out</span>
            </button>}`;

const targetStr = `{isAdmin && <button
              onClick={() => {
                triggerHaptic();
                setIsLogsOpen(true);
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Email Logs"
            >
              <Activity size={20} />
            </button>}`;

content = content.replace(targetStr, logoutBtnStr);

fs.writeFileSync('src/App.tsx', content);
