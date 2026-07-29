/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
interface ConcurrentOption { day: string; time: string; endTime?: string; }
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText, Search, Lock, LogIn, KeyRound, LogOut, Eye, EyeOff, MessageSquare, Send, Check, X, Info } from "lucide-react";
import { Chatbot } from "./components/Chatbot";
import { ExamForm } from "./components/ExamForm";
import { TimetablePreview } from "./components/TimetablePreview";
import { PaperSchedulePreview } from "./components/PaperSchedulePreview";

export const formatTimeAmPm = (time24?: string) => {
  if (!time24) return "";
  const match = time24.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time24;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

import { triggerHaptic, triggerHapticSuccess, triggerHapticError } from "./lib/haptics";
import type { TimetableEntry, EmailLog, SchoolClass, ExamEntry, PaperType, ChatMessage } from "./types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await window.fetch(input, { ...init, headers });
  const urlString = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
  if (response.status === 401 && !urlString.includes('/api/auth/login')) {
    localStorage.removeItem('adminToken');
                localStorage.removeItem('userToken');
                
    window.location.href = '/';
    return new Promise<Response>(() => {});
  }
  return response;
};

export default function App() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classesList, setClassesList] = useState<SchoolClass[]>([]);
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([]);
  const [selectedPaperTypeId, setSelectedPaperTypeId] = useState<string | null>(null);
  const [concurrentOptions, setConcurrentOptions] = useState<ConcurrentOption[]>([]);
  const [showConcurrentPrompt, setShowConcurrentPrompt] = useState(false);
  const [showConcurrentForm, setShowConcurrentForm] = useState(false);
  const [concurrentFormData, setConcurrentFormData] = useState<Partial<TimetableEntry>>({});
  const [selectedConcurrentDay, setSelectedConcurrentDay] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      showToast("Install App", "To install, tap 'Share' then 'Add to Home Screen' (iOS) or click the install icon in your browser address bar.", "success");
    }
  };
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [isPaperTypeFormOpen, setIsPaperTypeFormOpen] = useState(false);
  const [paperTypeFormData, setPaperTypeFormData] = useState({ name: "" });
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [appInfo, setAppInfo] = useState<any>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isComposingRequest, setIsComposingRequest] = useState(false);

  
  const [formData, setFormData] = useState<Partial<TimetableEntry>>({ days: ["Daily"] });
  const [additionalSessions, setAdditionalSessions] = useState<{day: string, time: string, endTime?: string}[]>([]);
  const [classFormData, setClassFormData] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'class' | 'entry' | 'exam' | 'allRecords' | 'allGlobalExams' | 'paperType', id: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'error' | 'success'} | null>(null);
  
  // Auth & User View States
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [userAuthMode, setUserAuthMode] = useState<"login" | "register" | "forgot" | "reset" | "verify-signup">("login");
  const [userAuthForm, setUserAuthForm] = useState({ name: "", email: "", password: "", code: "", newPassword: "" });
  const [isUserAuthenticating, setIsUserAuthenticating] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '', code: '', newPassword: '', confirmPassword: '' });
  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'classes' | 'papers'>('home');

  
  const exportPaperScheduleToPDF = async (forTeachers: boolean = false) => {
    triggerHaptic();
    try {
      const doc = new jsPDF('p', 'mm', 'a4'); // Portrait
      const currentType = paperTypes.find(t => t.id === selectedPaperTypeId);
      const typeName = currentType ? currentType.name : "EXAM";
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(1);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setDrawColor(20, 30, 60); 
      doc.setLineWidth(0.5);
      doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

      let startY = 48; 
      
      try {
        const response = await customFetch('/logo.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        const base64data = await new Promise((resolve) => {
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result);
        });
        doc.addImage(base64data as string, 'JPEG', pageWidth / 2 - 20, 20, 40, 24);
      } catch (err) {
        console.warn("Logo not found");
      }

      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.setTextColor(20, 30, 60);
      doc.text("PAPER SCHEDULE", pageWidth / 2, startY + 5, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(100, 110, 140);
      doc.text(typeName.toUpperCase(), pageWidth / 2, startY + 12, { align: 'center' });

      doc.setDrawColor(200, 205, 220);
      doc.setLineWidth(0.5);
      doc.line(pageWidth/2 - 40, startY + 18, pageWidth/2 + 40, startY + 18);

      const typeExams = exams.filter(e => e.paperTypeId === selectedPaperTypeId);
      const sortedExams = [...typeExams].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

      const getDayOfWeek = (dateStr: string) => {
        const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const d = new Date(dateStr + 'T12:00:00');
        return daysArr[d.getDay()];
      };

      const tableData = sortedExams.map(exam => {
        const dateDay = `${exam.date}\n${getDayOfWeek(exam.date)}`;
        const timeText = `${formatTimeAmPm(exam.time)} ${exam.endTime ? '- ' + formatTimeAmPm(exam.endTime) : ''}`;
        const invigs = exam.invigilators && exam.invigilators.length > 0 ? exam.invigilators.map(i => i.name).join(', ') : 'None';
        return forTeachers 
          ? [dateDay, timeText, exam.subject.toUpperCase(), invigs]
          : [dateDay, timeText, exam.subject.toUpperCase()];
      });

      if (sortedExams.length > 0) {
          autoTable(doc, {
            startY: startY + 25,
            head: forTeachers 
              ? [['DATE & DAY', 'TIME', 'SUBJECT', 'INVIGILATORS']]
              : [['DATE & DAY', 'TIME', 'SUBJECT']],
            body: tableData,
            theme: 'grid',
            headStyles: { 
               fillColor: [20, 30, 60],
               textColor: [255, 255, 255], 
               halign: 'center', 
               valign: 'middle', 
               fontStyle: 'bold', 
               fontSize: 10,
               lineColor: [20, 30, 60],
               lineWidth: 0.6
            },
            bodyStyles: { 
               halign: 'center', 
               valign: 'middle', 
               textColor: [20, 30, 60], 
               fontSize: 9, 
               fontStyle: 'bold',
               lineColor: [40, 50, 80],
               lineWidth: 0.6,
               cellPadding: 4, 
            },
            alternateRowStyles: { fillColor: [248, 249, 251] },
            styles: { font: 'times', overflow: 'linebreak', halign: 'center', valign: 'middle', cellWidth: 'wrap' },
            margin: { left: 24, right: 24 }
          });
      } else {
         doc.setFont("times", "italic");
         doc.setFontSize(14);
         doc.setTextColor(150, 150, 150);
         doc.text("No papers scheduled for this type.", pageWidth / 2, startY + 30, { align: 'center' });
      }

      const lastTableY = sortedExams.length > 0 ? (doc as any).lastAutoTable.finalY : startY + 40;

      doc.setFillColor(250, 251, 253);
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.5);
      if (forTeachers) {
        doc.roundedRect(24, lastTableY + 10, pageWidth - 48, 38, 2, 2, 'FD');
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.setTextColor(20, 30, 60);
        doc.text("Instructions for Invigilators:", 28, lastTableY + 16);
        doc.setFontSize(9.5);
        doc.setFont("times", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text("• All invigilators must be present 30 minutes before test timing and be in formal dressing.", 28, lastTableY + 22);
        doc.text("• Make sure students sit in class 15 minutes before and check their stationery/calculator (if needed).", 28, lastTableY + 28);
        doc.text("• Inform E.B's head in case of any issue during assessment and arrange your replacement.", 28, lastTableY + 34);
      } else {
        doc.roundedRect(24, lastTableY + 10, pageWidth - 48, 24, 2, 2, 'FD');
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.setTextColor(20, 30, 60);
        doc.text("Important Instructions:", 28, lastTableY + 16);
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled paper.", 28, lastTableY + 22);
        doc.text("• The administration reserves the right to modify the schedule; please refer to official notice boards for updates.", 28, lastTableY + 28);
      }

      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`, 24, pageHeight - 20);
      
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.6);
      doc.line(pageWidth - 74, pageHeight - 25, pageWidth - 24, pageHeight - 25);
      doc.text("Principal / Administrator", pageWidth - 49, pageHeight - 20, { align: 'center' });

      doc.save(`${typeName}_Schedule.pdf`);
    } catch (e) {
      console.error(e);
      showToast("Error", "Failed to generate PDF", "error");
      triggerHapticError();
    }
  };

  const exportToPDF = async () => {
    triggerHaptic();
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
      const currentClass = classesList.find(c => c.id === selectedClassId);
      const className = currentClass ? currentClass.name : "CLASS";
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Clean White Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // VIP Border - Normal
      doc.setDrawColor(20, 30, 60); // Deep Navy
      doc.setLineWidth(1);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setDrawColor(20, 30, 60); 
      doc.setLineWidth(0.5);
      doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

      let startY = 48; 
      
      // Logo
      let logoLoaded = false;
      try {
        const response = await customFetch('/logo.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        const base64data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        
        const img = new Image();
        img.src = base64data as string;
        await new Promise((resolve) => {
          img.onload = () => {
            const imgHeight = 22;
            const imgWidth = (img.width * imgHeight) / img.height;
            doc.addImage(img, 'JPEG', 20, 20, imgWidth, imgHeight);
            logoLoaded = true;
            resolve(true);
          };
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2000);
        });
      } catch (e) {
        console.error("Logo failed to load:", e);
      }

      // Header Content - Centered
      doc.setTextColor(20, 30, 60);
      doc.setFont("times", "bold");
      
      doc.setFontSize(28);
      doc.text("TEACH EDUCATION SYSTEM", pageWidth / 2, 30, { align: 'center' });
      
      // Elegant Gold Separator
      doc.setDrawColor(212, 175, 55); // Gold
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 60, 34, pageWidth / 2 + 60, 34);
      
      doc.setFontSize(14);
      doc.setTextColor(80, 80, 80);
      doc.setFont("times", "bold");
      // Align exact center
      const formattedSubtitle = `A C A D E M I C   T I M E T A B L E  -  ${className.toUpperCase().split('').join(' ')}`;
      doc.text(formattedSubtitle, pageWidth / 2, 41, { align: 'center' });

      // Prepare Data
      const classEntries = entries.filter(e => e.classId === selectedClassId);
      // Determine actual days to show
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      const emptyDays = new Set<string>();
      daysOfWeek.forEach(day => {
        const hasClasses = classEntries.some(e => e.days?.includes(day) || e.days?.includes('Daily'));
        const hasExams = false;
        if (!hasClasses && !hasExams) emptyDays.add(day);
      });

      const allTimes = new Set<string>();
      classEntries.forEach(e => allTimes.add(e.time));
      
      
      const timesArray = Array.from(allTimes).sort((a, b) => {
        const parseTime = (t: string) => {
           const match = t.match(/(\d+):(\d+)\s*(am|pm|a.m.|p.m.)?/i);
           if (!match) return t;
           let h = parseInt(match[1]);
           const m = parseInt(match[2]);
           const ampm = match[3]?.toLowerCase();
           if (ampm && ampm.includes('p') && h < 12) h += 12;
           if (ampm && ampm.includes('a') && h === 12) h = 0;
           return h * 60 + m;
        };
        const ta = parseTime(a);
        const tb = parseTime(b);
        return (typeof ta === 'number' && typeof tb === 'number') ? ta - tb : a.localeCompare(b);
      });

      const skipCells: Record<string, number> = {};
      
      const tableData = timesArray.map((time, rowIndex) => {
        let timeText = formatTimeAmPm(time);
        const rowData: any[] = [{ content: timeText, styles: { cellWidth: 28 } }];
        daysOfWeek.forEach(day => {
          if (emptyDays.has(day)) {
            if (rowIndex === 0) {
              // The "OFF" cell - adjusted font size smaller (12 instead of 14)
              rowData.push({ 
                content: "O F F", 
                rowSpan: timesArray.length, 
                styles: { 
                    halign: 'center', 
                    valign: 'middle', 
                    fillColor: [248, 250, 252], 
                    textColor: [180, 190, 200], 
                    fontStyle: 'bold', 
                    fontSize: 12,
                    cellPadding: 4
                } 
              });
            }
          } else {
            if (skipCells[day] > 0) {
              skipCells[day]--;
              return;
            }
            
            let cellText = "";
            let maxRowSpan = 1;
            
            const dayEntries = classEntries.filter(e => e.time === time && (e.days?.includes(day) || e.days?.includes('Daily')));
            if (dayEntries.length > 0) {
              cellText += dayEntries.map(e => e.subject.toUpperCase()).join("\\n");
              const entryWithEnd = dayEntries.find(e => e.endTime);
              if (entryWithEnd) {
                  let span = 1;
                  for (let i = rowIndex + 1; i < timesArray.length; i++) {
                      if (timesArray[i] < entryWithEnd.endTime) {
                          span++;
                      } else {
                          break;
                      }
                  }
                  maxRowSpan = Math.max(maxRowSpan, span);
              }
            }
            
            if (!cellText) {
              rowData.push("-");
            } else {
              if (maxRowSpan > 1) {
                  rowData.push({
                      content: cellText,
                      rowSpan: maxRowSpan,
                      styles: { halign: 'center', valign: 'middle' }
                  });
                  skipCells[day] = maxRowSpan - 1;
              } else {
                  rowData.push(cellText);
              }
            }
          }
        });
        return rowData;
      });

      // Add actual table
      if (timesArray.length > 0) {
          autoTable(doc, {
            startY: startY + 5,
            head: [['TIME', ...daysOfWeek.map(d => d.toUpperCase())]],
            body: tableData,
            theme: 'grid',
            headStyles: { 
              fillColor: [20, 30, 60], // Navy
              textColor: [255, 255, 255], 
              halign: 'center', 
              valign: 'middle', 
              fontStyle: 'bold', 
              fontSize: 10,
              lineColor: [20, 30, 60],
              lineWidth: 0.6
            },
            bodyStyles: { 
              halign: 'center', 
              valign: 'middle', 
              textColor: [20, 30, 60], 
              fontSize: 8, 
              fontStyle: 'bold',
              lineColor: [40, 50, 80], // Much darker grid lines
              lineWidth: 0.6, // Bolder grid lines
              cellPadding: 4, // Better padding
            },
            alternateRowStyles: { 
              fillColor: [248, 249, 251] 
            },
            styles: { 
              font: 'times', 
              overflow: 'linebreak', // Allows long subjects to wrap inside the cell instead of shrinking or cutting off
              halign: 'center',
              valign: 'middle',
              cellWidth: 'wrap' // wrap text appropriately
            },
            columnStyles: {
              // Ensure dynamic column sizing so text fits perfectly
              0: { cellWidth: 28 }, // TIME column
            },
            margin: { left: 24, right: 24 }
          });
      } else {
         doc.setFont("times", "italic");
         doc.setFontSize(14);
         doc.setTextColor(150, 150, 150);
         doc.text("No classes or exams scheduled for this class.", pageWidth / 2, startY + 20, { align: 'center' });
      }
      
      const lastTableY = timesArray.length > 0 ? (doc as any).lastAutoTable.finalY : startY + 30;
      
      // VIP Footer
      doc.setFillColor(250, 251, 253);
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.5);
      doc.roundedRect(24, lastTableY + 10, pageWidth - 48, 24, 2, 2, 'FD');

      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text("Important Instructions:", 28, lastTableY + 16);
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled class.", 28, lastTableY + 22);
      doc.text("• The administration reserves the right to modify the timetable; please refer to official notice boards for updates.", 28, lastTableY + 28);
      
      // Signature and Date
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`, 24, pageHeight - 20);
      
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.6);
      doc.line(pageWidth - 74, pageHeight - 25, pageWidth - 24, pageHeight - 25);
      doc.text("Principal / Administrator", pageWidth - 49, pageHeight - 20, { align: 'center' });
      
      doc.save(`${className}_Timetable.pdf`);
      setToastMessage({ title: "Success", message: "PDF Downloaded", type: "success" });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("PDF Export failed", error);
      setToastMessage({ title: "Error", message: "Failed to generate PDF", type: "error" });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) setIsAdmin(true);
    else setIsAdmin(false);
    
    const userToken = localStorage.getItem("userToken");
    if (userToken) setIsUser(true);
    else setIsUser(false);
    
    fetchEntries();
    fetchClasses();
    fetchExams();
    fetchPaperTypes();
    fetchSettings();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);


  const handleUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUserAuthenticating(true);
    triggerHaptic();

    try {
      if (userAuthMode === 'register') {
        if (userAuthForm.password !== (userAuthForm as any).confirmPassword) {
            showToast("Error", "Passwords do not match", "error");
            triggerHapticError();
            setIsUserAuthenticating(false);
            return;
        }
        
        // Send verification code
        const res = await window.fetch('/api/users/send-verification', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userAuthForm.email })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast("Success", "Verification code sent to your email", "success");
            setUserAuthMode('verify-signup');
        } else {
            showToast("Error", data.error || "Failed to send code", "error");
            triggerHapticError();
        }
        
      } else if (userAuthMode === 'verify-signup') {
        
        // Verify code and register
        const res = await window.fetch('/api/users/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userAuthForm.name, email: userAuthForm.email, password: userAuthForm.password, code: userAuthForm.code })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('userToken', data.token);
          setIsUser(true);
          showToast("Success", "Account created successfully", "success");
          triggerHapticSuccess();
        } else {
          showToast("Error", data.error || "Registration failed", "error");
          triggerHapticError();
        }
        
      } else if (userAuthMode === 'login') {
        const res = await window.fetch('/api/users/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userAuthForm.email, password: userAuthForm.password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('userToken', data.token);
          setIsUser(true);
          showToast("Success", "Logged in successfully", "success");
          triggerHapticSuccess();
        } else {
          showToast("Error", data.error || "Login failed", "error");
          triggerHapticError();
        }
      }
    } catch (error) {
        showToast("Error", "Authentication error", "error");
        triggerHapticError();
    } finally {
        setIsUserAuthenticating(false);
    }
  };

  const toggleTheme = () => {
    triggerHaptic();
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const showToast = (title: string, message: string, type: 'error' | 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const [reminderOffset, setReminderOffset] = useState<number>(180);

  const fetchSettings = async () => {
    try {
      const res = await customFetch("/api/settings");
      const data = await res.json();
      if (data.reminderOffset) setReminderOffset(data.reminderOffset);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (offset: number) => {
    try {
      await customFetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderOffset: offset }),
      });
      setReminderOffset(offset);
      showToast("Success", "Reminder time updated.", "success");
    } catch (e) {
      console.error(e);
      showToast("Error", "Failed to update settings.", "error");
    }
  };

  
  const fetchPaperTypes = async () => {
    try {
      const res = await customFetch("/api/paper-types");
      const data = await res.json();
      setPaperTypes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await customFetch("/api/exams");
      const data = await res.json();
      setExams(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await customFetch("/api/classes");
      const data = await res.json();
      setClassesList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await customFetch("/api/timetable");
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await customFetch("/api/logs");
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isLogsOpen) {
      fetchLogs();
    }
  }, [isLogsOpen]);


  const fetchMessages = async () => {
    try {
      const res = await customFetch("/api/messages");
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAdmin || isUser) {
      fetchMessages();
      // Poll every 30 seconds
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, isUser]);

  
  

  
  
  useEffect(() => {
    fetch('/api/app-info').then(res => res.json()).then(data => setAppInfo(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      if (isAdmin) {
        const unreadCount = messages.filter((m: any) => !m.readByAdmin).length;
        if (unreadCount > 0) {
          (navigator as any).setAppBadge(unreadCount).catch(console.error);
        } else {
          (navigator as any).clearAppBadge().catch(console.error);
        }
      } else if (isUser) {
        const unreadCount = messages.filter((m: any) => !m.readByUser).length;
        if (unreadCount > 0) {
          (navigator as any).setAppBadge(unreadCount).catch(console.error);
        } else {
          (navigator as any).clearAppBadge().catch(console.error);
        }
      }
    }
  }, [messages, isAdmin, isUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) {
      showToast("Error", "Message cannot be empty", "error");
      return;
    }
    
    setIsSendingMessage(true);
    triggerHaptic();

    try {
      const res = await customFetch('/api/messages', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: newMessageText, 
          receiverEmail: isAdmin ? selectedChatUser : 'admin' 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewMessageText("");
        fetchMessages();
      } else {
        showToast("Error", data.error || "Failed to send message.", "error");
      }
    } catch (err) {
      showToast("Error", "Failed to send message.", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormData.name.trim() || isSubmittingClass) return;
    
    const newClassData = { id: Date.now().toString(), name: classFormData.name.trim() };
    setIsClassFormOpen(false);
    setClassFormData({ name: "" });
    setIsSubmittingClass(true);
    triggerHapticSuccess();
    
    try {
      await customFetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClassData)
      });
      await fetchClasses();
    } catch (err) {
      triggerHapticError();
      console.error(err);
    } finally {
      setIsSubmittingClass(false);
    }
  };

  
  const handleAddPaperType = async (name: string) => {
    try {
      const res = await customFetch("/api/paper-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchPaperTypes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePaperTypeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    setDeleteConfirm({ type: 'paperType', id });
  };

  const handleDeleteClassClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    setDeleteConfirm({ type: 'class', id });
  };

  
  const confirmDeletePaperType = async (id: string) => {
    try {
      await customFetch(`/api/paper-types/${id}`, { method: "DELETE" });
      setPaperTypes(prev => prev.filter(t => t.id !== id));
      if (selectedPaperTypeId === id) setSelectedPaperTypeId(null);
      await fetchExams();
    } catch (e) {
      console.error(e);
    }
    setDeleteConfirm(null);
  };

  const confirmDeleteClass = async (id: string) => {
    try {
      await customFetch(`/api/classes/${id}`, { method: "DELETE" });
      await fetchClasses();
      await fetchEntries();
      await fetchExams();
      if (selectedClassId === id) setSelectedClassId(null);
      setDeleteConfirm(null);
    } catch (err) {
      triggerHapticError();
    }
  };
  
  const confirmDeleteAllRecords = async (classId: string) => {
    try {
      await customFetch(`/api/classes/${classId}/records`, { method: "DELETE" });
      await fetchEntries();
      await fetchExams();
      setDeleteConfirm(null);
      showToast("Success", "All records deleted for this class.", "success");
    } catch (err) {
      triggerHapticError();
    }
  };
  
  const confirmDeleteAllGlobalExams = async () => {
    try {
      await customFetch(`/api/exams/all`, { method: "DELETE" });
      await fetchExams();
      setDeleteConfirm(null);
      showToast("Success", "All scheduled papers deleted.", "success");
    } catch (err) {
      triggerHapticError();
    }
  };

  const handleExamSubmit = async (data: Partial<ExamEntry>) => {
    if (selectedPaperTypeId && !data.classId) data.paperTypeId = selectedPaperTypeId;
    setIsSubmittingEntry(true);
    triggerHaptic();
    try {
      const res = await customFetch(editingExamId ? `/api/exams/${editingExamId}` : "/api/exams", {
        method: editingExamId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, classId: selectedClassId, id: editingExamId || undefined }),
      });
      const result = await res.json();
      
      if (!res.ok) {
        showToast("Scheduling Conflict", result.error || "Failed to schedule exam.", "error");
        triggerHapticError();
      } else {
        triggerHapticSuccess();
        setIsExamFormOpen(false);
        setEditingExamId(null);
        showToast("Success", editingExamId ? "Paper updated successfully." : "Paper scheduled successfully.", "success");
        await fetchExams();
      }
    } catch (err) {
      triggerHapticError();
      showToast("Error", "A network error occurred.", "error");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleEventDrop = async (eventInfo: any) => {
    const event = eventInfo.event;
    const type = event.extendedProps.type;
    const raw = event.extendedProps.rawEntry;

    // We need to determine the new time/day based on event.start
    if (!event.start) return;

    const start = new Date(event.start);
    // Use local time from the browser
    const hours = start.getHours().toString().padStart(2, '0');
    const minutes = start.getMinutes().toString().padStart(2, '0');
    const newTime = `${hours}:${minutes}`;

    if (type === 'exam') {
      const year = start.getFullYear();
      const month = (start.getMonth() + 1).toString().padStart(2, '0');
      const day = start.getDate().toString().padStart(2, '0');
      const newDate = `${year}-${month}-${day}`;

      try {
        const res = await customFetch(`/api/exams/${raw.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...raw, time: newTime, date: newDate }),
        });
        const result = await res.json();
        if (!res.ok) {
          eventInfo.revert();
          showToast("Scheduling Conflict", result.error || "Failed to update exam.", "error");
        } else {
          showToast("Success", "Exam time updated.", "success");
          fetchExams();
        }
      } catch (e) {
        eventInfo.revert();
      }
    } else if (type === 'class') {
      const daysOfWeekMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const newDay = daysOfWeekMap[start.getDay()];
      
      try {
        const res = await customFetch(`/api/timetable/${raw.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...raw, time: newTime, days: [newDay] }),
        });
        const result = await res.json();
        if (!res.ok) {
          eventInfo.revert();
          showToast("Scheduling Conflict", result.error || "Failed to update class.", "error");
        } else {
          showToast("Success", "Class time updated.", "success");
          fetchEntries();
        }
      } catch (e) {
        eventInfo.revert();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEntry) return;
    
    const url = editingId ? `/api/timetable/${editingId}` : "/api/timetable";
    const method = editingId ? "PUT" : "POST";
    const submissionData = { 
      ...formData,
      classId: selectedClassId,
      id: editingId || Date.now().toString()
    };
    
    setIsSubmittingEntry(true);
    triggerHaptic();
    
    try {
      const res = await customFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const result = await res.json();
      
      if (!res.ok) {
        showToast("Scheduling Conflict", result.error || "Failed to schedule class.", "error");
        triggerHapticError();
      } else {
        const submittedOptions: ConcurrentOption[] = [];
        if (formData.days && formData.days.length > 0 && formData.time) {
          submittedOptions.push({ day: formData.days[0], time: formData.time, endTime: formData.endTime });
        }
        if (!editingId && additionalSessions.length > 0) {
            for (const session of additionalSessions) {
               if (!session.time) continue;
               const sessionData = {
                  ...formData,
                  classId: selectedClassId,
                  id: Date.now().toString() + Math.random().toString(),
                  days: [session.day],
                  time: session.time,
                  endTime: session.endTime
               };
               const sessionRes = await customFetch("/api/timetable", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(sessionData)
               });
               const sessionResult = await sessionRes.json();
               if (!sessionRes.ok) {
                   showToast("Scheduling Conflict", `Failed to schedule extra class on ${session.day}. ${sessionResult.error}`, "error");
               } else {
                   submittedOptions.push({ day: session.day, time: session.time, endTime: session.endTime });
               }
            }
        }

        triggerHapticSuccess();
        await fetchEntries();
        if (!editingId && submittedOptions.length > 0) {
           setConcurrentOptions(submittedOptions);
           setShowConcurrentPrompt(true);
           setIsFormOpen(false);
           setFormData({ days: ["Daily"] });
           setAdditionalSessions([]);
        } else {
           setIsFormOpen(false);
           setFormData({ days: ["Daily"] });
           setAdditionalSessions([]);
           setEditingId(null);
           showToast("Success", editingId ? "Class updated." : "Class added.", "success");
        }
      }
    } catch (err) {
      triggerHapticError();
      console.error(err);
      showToast("Error", "Network error.", "error");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    triggerHaptic();
    
    try {
      if (authMode === 'login') {
        const res = await customFetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username, password: authForm.password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          setIsAdmin(true);
          setIsLoginOpen(false);
          setAuthForm({ username: '', password: '', code: '', newPassword: '', confirmPassword: '' });
          showToast("Success", "Logged in successfully.", "success");
        } else {
          showToast("Error", data.error || "Invalid credentials", "error");
          triggerHapticError();
        }
      } else if (authMode === 'forgot') {
        const res = await customFetch('/api/auth/forgot-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username })
        });
        const data = await res.json();
        if (data.success) {
          setAuthMode('reset');
          showToast("Success", "Reset code sent to email.", "success");
        } else {
          showToast("Error", data.error || "User not found", "error");
          triggerHapticError();
        }
      } else if (authMode === 'reset') {
        if (!authForm.code || authForm.code.trim().length === 0) {
          showToast("Error", "Please enter the 6-digit verification code.", "error");
          triggerHapticError();
          setIsAuthenticating(false);
          return;
        }
        if (!authForm.newPassword || authForm.newPassword.trim().length === 0) {
          showToast("Error", "Please enter a new password.", "error");
          triggerHapticError();
          setIsAuthenticating(false);
          return;
        }
        if (!authForm.confirmPassword || authForm.confirmPassword.trim().length === 0) {
          showToast("Error", "Please confirm your new password.", "error");
          triggerHapticError();
          setIsAuthenticating(false);
          return;
        }
        if (authForm.newPassword.length < 6) {
          showToast("Error", "New password must be at least 6 characters long.", "error");
          triggerHapticError();
          setIsAuthenticating(false);
          return;
        }
        if (authForm.newPassword !== authForm.confirmPassword) {
          showToast("Error", "New password and Confirm password do not match.", "error");
          triggerHapticError();
          setIsAuthenticating(false);
          return;
        }

        const res = await customFetch('/api/auth/reset-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username, code: authForm.code.trim(), newPassword: authForm.newPassword })
        });
        const data = await res.json();
        if (data.success) {
          setAuthMode('login');
          setAuthForm({ username: '', password: '', code: '', newPassword: '', confirmPassword: '' });
          showToast("Success", "Password reset successfully. Please login with your new password.", "success");
        } else {
          showToast("Error", data.error || "Invalid code", "error");
          triggerHapticError();
        }
      }
    } catch (err) {
      triggerHapticError();
      showToast("Error", "Network error occurred.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleConcurrentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEntry) return;

    const selectedOption = concurrentOptions.find(o => o.day === selectedConcurrentDay);
    if (!selectedOption) return;

    const submissionData = {
      ...concurrentFormData,
      classId: selectedClassId,
      days: [selectedOption.day],
      time: selectedOption.time,
      endTime: selectedOption.endTime,
      id: Date.now().toString(),
      allowConcurrent: true
    };

    setIsSubmittingEntry(true);
    triggerHaptic();

    try {
      const res = await customFetch("/api/timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
      });
      const result = await res.json();
      if (!res.ok) {
         showToast("Scheduling Conflict", result.error || "Failed to schedule concurrent class.", "error");
         triggerHapticError();
      } else {
         triggerHapticSuccess();
         await fetchEntries();
         setShowConcurrentForm(false);
         setShowConcurrentPrompt(true); 
         setConcurrentFormData({});
      }
    } catch (err) {
      triggerHapticError();
      console.error(err);
      showToast("Error", "Network error.", "error");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    triggerHaptic();
    setDeleteConfirm({ type: 'entry', id });
  };

  const confirmDeleteEntry = async (id: string) => {
    try {
      await customFetch(`/api/timetable/${id}`, { method: "DELETE" });
      await fetchEntries();
      setDeleteConfirm(null);
    } catch (err) {
      triggerHapticError();
    }
  };

  const confirmDeleteExam = async (id: string) => {
    try {
      await customFetch(`/api/exams/${id}`, { method: "DELETE" });
      await fetchExams();
      setDeleteConfirm(null);
    } catch (err) {
      triggerHapticError();
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    triggerHaptic();
    setFormData(entry);
    setEditingId(entry.id);
    setAdditionalSessions([]);
    setIsFormOpen(true);
  };

  const generateAIContent = async () => {
    triggerHaptic();
    setIsGenerating(true);
    try {
      const res = await customFetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Generate a realistic example timetable entry for a high school class. Return a JSON object with properties: teacherName, subject, time (string in HH:MM format, 24-hr), teacherEmail. Do NOT include markdown formatting or extra text." })
      });
      const data = await res.json();
      const textResponse = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(textResponse);
      setFormData({ ...parsed, days: ["Daily"] });
    } catch (e) {
      triggerHapticError();
      console.error("AI Generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    const grade = entry.grade || 'Other';
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);


  if (!isAdmin && !isUser) {
    return (
      <div className={`min-h-screen relative flex items-center justify-center p-6 transition-colors duration-500 ${isDark ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px]" />
          <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px]" />
        </div>
        
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${toastMessage.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 'bg-green-500/90 text-white border-green-400'}`}
            >
              <span className="font-semibold">{toastMessage.title}:</span> {toastMessage.message}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={toggleTheme} className="absolute top-6 right-6 p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm z-50">
           {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md liquid-glass-heavy rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg text-white">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome to Timetable</h1>
            <p className="text-slate-500 mt-2">
               {userAuthMode === 'login' ? 'Sign in to your account' : 
                userAuthMode === 'register' ? 'Create a new account' :
                userAuthMode === 'forgot' ? 'Reset your password' : 'Enter new password'}
            </p>
          </div>

          <form onSubmit={handleUserAuthSubmit} className="space-y-4">
            {userAuthMode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" required value={userAuthForm.name} onChange={e => setUserAuthForm({...userAuthForm, name: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="John Doe" />
              </div>
            )}
            
            {(userAuthMode === 'login' || userAuthMode === 'register' || userAuthMode === 'forgot' || userAuthMode === 'reset') && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" required value={userAuthForm.email} onChange={e => setUserAuthForm({...userAuthForm, email: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="you@example.com" />
              </div>
            )}

            {userAuthMode === 'reset' && (
              <div>
                <label className="block text-sm font-medium mb-1">Reset Code</label>
                <input type="text" required value={userAuthForm.code} onChange={e => setUserAuthForm({...userAuthForm, code: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="6-digit code" />
              </div>
            )}
            
            {userAuthMode === 'verify-signup' && (
              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <input type="text" required value={userAuthForm.code} onChange={e => setUserAuthForm({...userAuthForm, code: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2" placeholder="Enter code from email" />
              </div>
            )}

            {(userAuthMode === 'login' || userAuthMode === 'register') && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium">Password</label>
                  {userAuthMode === 'login' && (
                    <button type="button" onClick={() => setUserAuthMode('forgot')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={userAuthForm.password} onChange={e => setUserAuthForm({...userAuthForm, password: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            )}

            {(userAuthMode === 'register' || userAuthMode === 'reset') && (
               <>
                 {userAuthMode === 'reset' && (
                   <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <div className="relative">
                        <input type={showNewPassword ? "text" : "password"} required value={userAuthForm.newPassword} onChange={e => setUserAuthForm({...userAuthForm, newPassword: e.target.value})} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 pr-10" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showNewPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                      </div>
                   </div>
                 )}
                 <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} required value={(userAuthForm as any).confirmPassword || ''} onChange={e => setUserAuthForm({...userAuthForm, confirmPassword: e.target.value} as any)} className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 pr-10" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                 </div>
               </>
            )}

            <button type="submit" disabled={isUserAuthenticating} className="w-full py-3 mt-4 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isUserAuthenticating ? 'Please wait...' : 
               userAuthMode === 'login' ? 'Sign In' : 
               userAuthMode === 'register' ? 'Create Account' :
               userAuthMode === 'verify-signup' ? 'Verify Account' : userAuthMode === 'forgot' ? 'Send Reset Code' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {userAuthMode === 'login' ? (
              <p>Don't have an account? <button onClick={() => setUserAuthMode('register')} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Sign up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setUserAuthMode('login')} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Sign in</button></p>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 text-center">
             <button onClick={() => setIsLoginOpen(true)} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-2 mx-auto">
                <Lock size={14}/> Admin Login
             </button>
          </div>
        </motion.div>

        
        {/* Auth Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white flex flex-col"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                {authMode === 'login' ? <Lock size={32} /> : <KeyRound size={32} />}
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
                {authMode === 'login' ? 'Admin Login' : authMode === 'forgot' ? 'Reset Password' : 'New Password'}
              </h2>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">{authMode === 'login' ? 'Username / Email' : 'Email'}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      disabled={authMode === 'reset'}
                      value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder={authMode === 'login' ? 'admin' : 'admin@example.com'}
                    />
                  </div>
                </div>

                {authMode === 'login' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        required type={showPassword ? "text" : "password"}
                        value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}
                        className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="text-right mt-2">
                      <button type="button" onClick={() => setAuthMode('forgot')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</button>
                    </div>
                  </div>
                )}

                {authMode === 'reset' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">6-Digit Code</label>
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type="text"
                          value={authForm.code} onChange={e => setAuthForm({...authForm, code: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="123456"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type={showNewPassword ? "text" : "password"}
                          value={authForm.newPassword} onChange={e => setAuthForm({...authForm, newPassword: e.target.value})}
                          className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type={showConfirmPassword ? "text" : "password"}
                          value={authForm.confirmPassword} onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})}
                          className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" disabled={isAuthenticating} onClick={() => {
                      if (authMode !== 'login') setAuthMode('login');
                      else setIsLoginOpen(false);
                    }} 
                    className="flex-1 py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-900 dark:text-slate-200 transition-colors"
                  >
                    {authMode !== 'login' ? 'Back' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={isAuthenticating} className="flex-1 py-3 rounded-2xl font-medium bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                    {isAuthenticating && <Sparkles size={16} className="animate-pulse" />}
                    {authMode === 'login' ? 'Login' : authMode === 'forgot' ? 'Send Code' : 'Reset'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
</div>
    );
  }

  return (
    <div className="min-h-screen relative pb-32 text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background gradients for Liquid Glass effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] transition-all duration-1000" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px] transition-all duration-1000" />
      </div>

      <div id="timetable-content" className="relative max-w-5xl mx-auto px-6 pt-12 md:pt-20 pb-32">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${toastMessage.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 'bg-green-500/90 text-white border-green-400'}`}
            >
              <span className="font-semibold">{toastMessage.title}:</span> {toastMessage.message}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 printable-header">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
              className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {activeTab === 'home' ? "Dashboard" : selectedClassId ? (
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedClassId(null)}>
                  <span className="text-blue-600 hover:opacity-80 transition-opacity">&larr;</span>
                  {classesList.find(c => c.id === selectedClassId)?.name} Schedule
                </div>
              ) : activeTab === 'papers' ? (
                selectedPaperTypeId ? (
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedPaperTypeId(null)}>
                    <span className="text-blue-600 hover:opacity-80 transition-opacity">&larr;</span>
                    {paperTypes.find(t => t.id === selectedPaperTypeId)?.name} Papers
                  </div>
                ) : (
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('home')}>
                    <span className="text-blue-600 hover:opacity-80 transition-opacity">&larr;</span>
                    Scheduled Papers
                  </div>
                )
              ) : (
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('home')}>
                  <span className="text-blue-600 hover:opacity-80 transition-opacity">&larr;</span>
                  Classes
                </div>
              )}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-2 text-lg"
            >
              {activeTab === 'home' ? "Select a module to view" : selectedClassId ? "Manage timetable for this class" : activeTab === 'papers' ? (selectedPaperTypeId ? "Manage papers for this type" : "Select a paper type to view") : "Select a class to view its schedule"}
            </motion.p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 no-print w-full md:w-auto mt-4 md:mt-0">
            {selectedClassId && (
              <button onClick={exportToPDF} className="p-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm" title="Export Class Timetable to PDF">
                <Printer size={20} />
              </button>
            )}
            {!selectedClassId && activeTab === 'papers' && selectedPaperTypeId && (
              <div className="flex gap-2">
                <button onClick={() => exportPaperScheduleToPDF(false)} className="px-4 py-2 text-sm bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm flex items-center gap-2" title="Print for Students (No Invigilators)">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Students</span>
                </button>
                <button onClick={() => exportPaperScheduleToPDF(true)} className="px-4 py-2 text-sm bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm flex items-center gap-2" title="Print for Teachers (With Invigilators)">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Teachers</span>
                </button>
              </div>
            )}
            
            {!selectedClassId && isAdmin && activeTab === 'papers' && selectedPaperTypeId && (
              <button 
                onClick={() => {
                  triggerHaptic();
                  setEditingExamId(null);
                  setIsExamFormOpen(true);
                }} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Add Paper</span>
              </button>
            )}
            
            {!selectedClassId && isAdmin && activeTab === 'papers' && !selectedPaperTypeId && (
              <button 
                onClick={() => {
                  triggerHaptic();
                  setIsPaperTypeFormOpen(true);
                }} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Add Type</span>
              </button>
            )}

            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="p-3 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors shadow-sm shrink-0"
                title="Install App"
              >
                <Download size={20} />
              </button>
            )}

            {isUser && !isAdmin && (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsRequestsModalOpen(true);
                  if (isUser && !isAdmin) {
                      customFetch('/api/messages/read', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ otherUserEmail: 'admin' })
                      }).then(() => fetchMessages()).catch(console.error);
                  }
                }}
                className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm relative shrink-0"
                title="Chat with Admin"
              >
                <MessageSquare size={20} />
                {messages.filter(r => r.readByUser === false).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold text-white">
                    {messages.filter(r => r.readByUser === false).length}
                  </span>
                )}
              </button>
            )}
            {isAdmin && <button
              onClick={() => {
                  triggerHaptic();
                  setIsRequestsModalOpen(true);
                  if (isUser && !isAdmin) {
                      customFetch('/api/messages/read', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ otherUserEmail: 'admin' })
                      }).then(() => fetchMessages()).catch(console.error);
                  }
                }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm relative shrink-0"
              title="User Chats"
            >
              <MessageSquare size={20} />
              {(() => {
                const unreadUsers = new Set(messages.filter(r => !r.readByAdmin).map(r => r.senderEmail));
                return unreadUsers.size > 0 ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold text-white">
                    {unreadUsers.size}
                  </span>
                ) : null;
              })()}
            </button>}

            {(isAdmin || isUser) && (
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center"
                >
                  <User size={20} className="text-slate-700 dark:text-slate-300" />
                </button>

                {isAccountMenuOpen && (
                  <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black/90 backdrop-blur-md rounded-2xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden z-50">
                    
                    <button
                      onClick={() => { toggleTheme(); setIsAccountMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    {isAdmin && (
                      <div className="border-b border-t border-black/5 dark:border-white/10">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Admin Settings
                        </div>
                        <div className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-300">
                          <Clock size={16} />
                          <select
                            value={reminderOffset}
                            onChange={(e) => updateSettings(Number(e.target.value))}
                            className="bg-transparent font-medium focus:outline-none appearance-none cursor-pointer flex-1"
                          >
                            <option value={180}>3h before</option>
                            <option value={240}>4h before</option>
                            <option value={300}>5h before</option>
                          </select>
                        </div>
                        <button
                          onClick={() => { setIsLogsOpen(true); setIsAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <Activity size={16} />
                          Email Logs
                        </button>
                      </div>
                    )}


                    {isUser && !isAdmin && (
                      <div className="border-b border-t border-black/5 dark:border-white/10">
                        <button
                          onClick={() => { setIsAboutModalOpen(true); setIsAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <Info size={16} />
                          About App
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setIsAdmin(false);
                        setIsUser(false);
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('userToken');
                        setIsAccountMenuOpen(false);
                        setUserAuthMode('login');
                        setAuthMode('login');
                        showToast("Success", "Logged out successfully", "success");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                  </>
                )}
              </div>
            )}


            {selectedClassId && isAdmin ? (
              <div className="flex gap-2 ml-auto md:ml-0">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setDeleteConfirm({ type: 'allRecords', id: selectedClassId });
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shrink-0"
                  title="Delete All Records"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptic();
                    setEditingId(null);
                    setFormData({});
                    setAdditionalSessions([]);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shrink-0"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Entry</span>
                </button>
              </div>
            ) : !selectedClassId && isAdmin && activeTab === 'classes' ? (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsClassFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-blue-600/20 shrink-0 ml-auto md:ml-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Class</span>
              </button>
            ) : null}
          </div>
        </header>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {!selectedClassId ? (
              <>
                <div className="mb-8">
                  {activeTab === 'home' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => { triggerHaptic(); setActiveTab('classes'); }}
                        className="liquid-glass rounded-3xl p-10 group relative overflow-hidden text-slate-900 dark:text-white cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors border border-slate-200/50 dark:border-white/10 flex flex-col items-center justify-center text-center gap-6 h-72 shadow-sm hover:shadow-md"
                      >
                        <div className="p-6 rounded-3xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                          <GraduationCap size={56} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold mb-3">Classes</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">Manage timetables and schedules</p>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        onClick={() => { triggerHaptic(); setActiveTab('papers'); }}
                        className="liquid-glass rounded-3xl p-10 group relative overflow-hidden text-slate-900 dark:text-white cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors border border-slate-200/50 dark:border-white/10 flex flex-col items-center justify-center text-center gap-6 h-72 shadow-sm hover:shadow-md"
                      >
                        <div className="p-6 rounded-3xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                          <FileText size={56} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold mb-3">Scheduled Papers</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">View and manage global exams</p>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="relative max-w-2xl mx-auto mb-8">
                      <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder={activeTab === 'classes' ? "Search for a class, subject, or teacher to view its schedule..." : "Search scheduled papers by subject or invigilator..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-500 shadow-sm text-lg"
                      />
                    </div>
                  )}
                </div>
                {activeTab === 'classes' && (
                  <>
                    
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {classesList.filter(cls => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return cls.name.toLowerCase().includes(q) ||
                            entries.filter(e => e.classId === cls.id).some(e => e.subject.toLowerCase().includes(q) || e.teacherName.toLowerCase().includes(q));
                        }).length === 0 && searchQuery ? (
                          <div className="col-span-full text-center py-12 text-slate-500">
                            <Search className="mx-auto mb-3 opacity-50" size={32} />
                            <p className="text-lg">No classes found matching "{searchQuery}"</p>
                          </div>
                        ) : classesList.filter(cls => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return cls.name.toLowerCase().includes(q) ||
                            entries.filter(e => e.classId === cls.id).some(e => e.subject.toLowerCase().includes(q) || e.teacherName.toLowerCase().includes(q));
                        }).map((cls, idx) => (
                          <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => {
                              triggerHaptic();
                              setSelectedClassId(cls.id);
                            }}
                            className="liquid-glass rounded-3xl p-6 group relative overflow-hidden text-slate-900 dark:text-white cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <GraduationCap size={24} />
                              </div>
                              {isAdmin && <button 
                                onClick={(e) => handleDeleteClassClick(cls.id, e)} 
                                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={16} />
                              </button>}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{cls.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {entries.filter(e => e.classId === cls.id).length} scheduled sessions
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
     
                    {classesList.length === 0 && (
                      <div className="py-20 text-center text-slate-500">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                          <GraduationCap className="text-slate-400" size={24} />
                        </div>
                        <p>{isAdmin ? "No classes available. Create your first class." : "No classes have been published yet."}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Global Exams Section */}
                {activeTab === 'papers' && (
                  <div className="mt-4">
                    {!selectedPaperTypeId ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <AnimatePresence>
                            {paperTypes.filter(type => {
                              if (!searchQuery) return true;
                              return type.name.toLowerCase().includes(searchQuery.toLowerCase());
                            }).length === 0 && searchQuery ? (
                              <div className="col-span-full text-center py-12 text-slate-500">
                                <Search className="mx-auto mb-3 opacity-50" size={32} />
                                <p className="text-lg">No paper types found matching "{searchQuery}"</p>
                              </div>
                            ) : paperTypes.filter(type => {
                              if (!searchQuery) return true;
                              return type.name.toLowerCase().includes(searchQuery.toLowerCase());
                            }).map((pt, idx) => (
                              <motion.div
                                key={pt.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                  triggerHaptic();
                                  setSelectedPaperTypeId(pt.id);
                                }}
                                className="liquid-glass rounded-3xl p-6 group relative overflow-hidden text-slate-900 dark:text-white cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    <FileText size={24} />
                                  </div>
                                  {isAdmin && <button 
                                    onClick={(e) => handleDeletePaperTypeClick(pt.id, e)} 
                                    className="p-2 rounded-full hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={16} />
                                  </button>}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{pt.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {exams.filter(e => e.paperTypeId === pt.id).length} scheduled papers
                                </p>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        {paperTypes.length === 0 && (
                          <div className="py-20 text-center text-slate-500">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                              <FileText className="text-slate-400" size={24} />
                            </div>
                            <p>{isAdmin ? "No paper types available. Create your first paper type." : "No paper types have been added yet."}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {isAdmin && exams.filter(e => e.paperTypeId === selectedPaperTypeId).length > 0 && (
                          <div className="flex justify-end mb-6">
                            <button
                              onClick={() => {
                                triggerHaptic();
                                setDeleteConfirm({ type: 'allGlobalExams', id: 'global' });
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg w-fit"
                              title="Delete All Scheduled Papers"
                            >
                              <Trash2 size={18} />
                              <span className="hidden sm:inline">Clear All</span>
                            </button>
                          </div>
                        )}
                        
                        <PaperSchedulePreview
                          exams={exams.filter(exam => exam.paperTypeId === selectedPaperTypeId).filter(exam => {
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return exam.subject.toLowerCase().includes(q) ||
                                      (exam.invigilators && exam.invigilators.some(inv => inv.name.toLowerCase().includes(q) || inv.email.toLowerCase().includes(q)));
                          })}
                          classes={classesList}
                          isAdmin={isAdmin}
                          onEdit={(examId) => { setEditingExamId(examId); setIsExamFormOpen(true); }}
                          onDelete={(examId) => setDeleteConfirm({ type: 'exam', id: examId })}
                        />
             
                    {exams.filter(exam => exam.paperTypeId === selectedPaperTypeId).length === 0 && (
                      <div className="py-20 text-center text-slate-500">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                          <FileText className="text-slate-400" size={24} />
                        </div>
                        <p>{isAdmin ? "No scheduled papers available in this type. Create your first paper." : "No papers have been scheduled yet."}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
              </>
            ) : (
              <>
                <div className="mb-12">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Timetable Preview</h3>
                  <TimetablePreview 
                    classEntries={entries.filter(e => e.classId === selectedClassId)}
                    
                  />
                </div>
                {isAdmin && <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">All Entries</h3>}
                {isAdmin && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {entries.filter(e => e.classId === selectedClassId).map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="liquid-glass rounded-3xl p-6 group relative overflow-hidden text-slate-900 dark:text-white"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide">
                              {formatTimeAmPm(entry.time)}
                            </div>
                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold tracking-wide">
                              {entry.days?.[0] || 'Daily'}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleEdit(entry)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteClick(entry.id)} className="p-2 rounded-full hover:bg-red-500/10 text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-1 line-clamp-1">{entry.subject}</h3>
                        <div className="space-y-2 mt-4 text-sm text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <User size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">{entry.teacherName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                            <span className="truncate text-slate-800 dark:text-slate-200">{entry.teacherEmail}</span>
                          </div>
                          {entry.taName && (
                            <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-2 mt-2">
                              <User size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                              <span className="font-medium text-slate-900 dark:text-slate-100">TA: {entry.taName}</span>
                            </div>
                          )}
                          {entry.taEmail && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                              <span className="truncate text-slate-800 dark:text-slate-200">{entry.taEmail}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>}
                
                {isAdmin && entries.filter(e => e.classId === selectedClassId).length === 0 && (
                  <div className="py-20 text-center text-slate-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <Clock className="text-slate-400" size={24} />
                    </div>
                    <p>No schedule entries for this class. Add one to get started.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      
      {/* Concurrent Prompt Modal */}
      <AnimatePresence>
        {showConcurrentPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                 setShowConcurrentPrompt(false);
                 showToast("Success", "Schedule entry saved.", "success");
              }}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                <Sparkles size={32} />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Add another subject?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Do you want to add another subject class at the same time?
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowConcurrentPrompt(false);
                    showToast("Success", "Schedule entry saved.", "success");
                  }} 
                  className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                >
                  No
                </button>
                <button 
                  onClick={() => {
                    setShowConcurrentPrompt(false);
                    setShowConcurrentForm(true);
                    setSelectedConcurrentDay(concurrentOptions[0].day);
                    setConcurrentFormData({});
                  }} 
                  className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-blue-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform hover:bg-blue-700"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Concurrent Form Modal */}
      <AnimatePresence>
        {showConcurrentForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                 setShowConcurrentForm(false);
                 showToast("Success", "Schedule entry saved.", "success");
              }}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  Concurrent Class
                </h2>
              </div>

              <form onSubmit={handleConcurrentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Subject / Course</label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={concurrentFormData.subject || ""} onChange={e => setConcurrentFormData({...concurrentFormData, subject: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Day</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select 
                        required
                        value={selectedConcurrentDay} 
                        onChange={e => setSelectedConcurrentDay(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all appearance-none"
                      >
                        {concurrentOptions.map((opt, idx) => (
                           <option key={idx} value={opt.day}>{opt.day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Time</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        disabled
                        value={concurrentOptions.find(o => o.day === selectedConcurrentDay)?.time || ""}
                        className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={concurrentFormData.teacherName || ""} onChange={e => setConcurrentFormData({...concurrentFormData, teacherName: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mr. Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="email"
                      value={concurrentFormData.teacherEmail || ""} onChange={e => setConcurrentFormData({...concurrentFormData, teacherEmail: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="teacher@school.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">TA Name (Optional)</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text"
                          value={concurrentFormData.taName || ""} onChange={e => setConcurrentFormData({...concurrentFormData, taName: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="e.g. Alex"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">TA Email (Optional)</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="email"
                          value={concurrentFormData.taEmail || ""} onChange={e => setConcurrentFormData({...concurrentFormData, taEmail: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="ta@school.edu"
                        />
                      </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" disabled={isSubmittingEntry} onClick={() => {
                      setShowConcurrentForm(false);
                      showToast("Success", "Schedule entry saved.", "success");
                    }} 
                    className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingEntry} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmittingEntry && <Sparkles size={16} className="animate-pulse" />}
                    Add Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  {editingId ? "Edit Class" : "New Class"}
                </h2>
                <button
                  type="button"
                  onClick={generateAIContent}
                  disabled={isGenerating}
                  className="p-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                  title="Auto-fill with Gemini"
                >
                  <Sparkles size={18} className={isGenerating ? "animate-pulse" : ""} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Subject</label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={formData.subject || ""} onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Day</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select 
                        required
                        value={formData.days?.[0] || "Daily"} 
                        onChange={e => setFormData({...formData, days: [e.target.value]})}
                        className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all appearance-none"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Start Time</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          required type="time"
                          value={formData.time || ""} onChange={e => setFormData({...formData, time: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">End Time</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="time"
                          value={formData.endTime || ""} onChange={e => setFormData({...formData, endTime: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Sessions */}
                  {!editingId && additionalSessions.map((session, index) => (
                    <div key={index} className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 relative">
                      <button 
                        type="button" 
                        onClick={() => {
                          const newSessions = [...additionalSessions];
                          newSessions.splice(index, 1);
                          setAdditionalSessions(newSessions);
                        }}
                        className="absolute right-0 top-4 text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Additional Schedule {index + 1}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Day</label>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                              required
                              value={session.day}
                              onChange={e => {
                                const newSessions = [...additionalSessions];
                                newSessions[index].day = e.target.value;
                                setAdditionalSessions(newSessions);
                              }}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white appearance-none"
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Start Time</label>
                          <div className="relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              required type="time"
                              value={session.time}
                              onChange={e => {
                                const newSessions = [...additionalSessions];
                                newSessions[index].time = e.target.value;
                                setAdditionalSessions(newSessions);
                              }}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">End Time</label>
                          <div className="relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="time"
                              value={session.endTime || ""}
                              onChange={e => {
                                const newSessions = [...additionalSessions];
                                newSessions[index].endTime = e.target.value;
                                setAdditionalSessions(newSessions);
                              }}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!editingId && (
                    <button
                      type="button"
                      onClick={() => setAdditionalSessions([...additionalSessions, { day: "Monday", time: "" }])}
                      className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <Plus size={16} /> Add another day/time for this class
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={formData.teacherName || ""} onChange={e => setFormData({...formData, teacherName: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mr. Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Teacher Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="email"
                      value={formData.teacherEmail || ""} onChange={e => setFormData({...formData, teacherEmail: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="teacher@school.edu"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">TA Name (Optional)</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text"
                          value={formData.taName || ""} onChange={e => setFormData({...formData, taName: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">TA Email (Optional)</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="email"
                          value={formData.taEmail || ""} onChange={e => setFormData({...formData, taEmail: e.target.value})}
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                          placeholder="ta@school.edu"
                        />
                      </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" disabled={isSubmittingEntry} onClick={() => setIsFormOpen(false)} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingEntry} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmittingEntry && <Sparkles size={16} className="animate-pulse" />}
                    {editingId ? "Save Changes" : "Add Entry"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Class Form Modal */}
      <AnimatePresence>
        {isClassFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsClassFormOpen(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  New Class
                </h2>
              </div>

              <form onSubmit={handleAddClass} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Class / Grade Name</label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={classFormData.name} onChange={e => setClassFormData({ name: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Class IX"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" disabled={isSubmittingClass} onClick={() => setIsClassFormOpen(false)} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingClass} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-blue-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmittingClass && <Sparkles size={16} className="animate-pulse" />}
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Paper Type Form Modal */}
      <AnimatePresence>
        {isPaperTypeFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPaperTypeFormOpen(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  New Paper Type
                </h2>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (paperTypeFormData.name.trim()) {
                  await handleAddPaperType(paperTypeFormData.name.trim());
                  setIsPaperTypeFormOpen(false);
                  setPaperTypeFormData({ name: "" });
                }
              }} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Type Name</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="text"
                      value={paperTypeFormData.name} onChange={e => setPaperTypeFormData({ name: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white/90 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                      placeholder="e.g. Mids, Finals"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsPaperTypeFormOpen(false)} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-red-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm liquid-glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Delete {deleteConfirm.type === 'class' ? 'Class' : deleteConfirm.type === 'exam' ? 'Exam' : deleteConfirm.type === 'allRecords' ? 'All Records' : deleteConfirm.type === 'allGlobalExams' ? 'All Papers' : 'Entry'}?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {deleteConfirm.type === 'class' 
                  ? "Are you sure you want to delete this class? All of its schedule entries will also be permanently deleted."
                  : deleteConfirm.type === 'exam' ? "Are you sure you want to delete this exam?" 
                  : deleteConfirm.type === 'allRecords' ? "Are you sure you want to delete all scheduled entries and exams for this class? This action cannot be undone."
                  : deleteConfirm.type === 'allGlobalExams' ? "Are you sure you want to delete all scheduled papers? This action cannot be undone."
                  : "Are you sure you want to delete this scheduled class entry?"}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)} 
                  className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'class') confirmDeleteClass(deleteConfirm.id);
                    else if (deleteConfirm.type === 'paperType') confirmDeletePaperType(deleteConfirm.id);
                    else if (deleteConfirm.type === 'entry') confirmDeleteEntry(deleteConfirm.id);
                    else if (deleteConfirm.type === 'allRecords') confirmDeleteAllRecords(deleteConfirm.id);
                    else if (deleteConfirm.type === 'allGlobalExams') confirmDeleteAllGlobalExams();
                    else confirmDeleteExam(deleteConfirm.id);
                  }} 
                  className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-red-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        
        
        
        

        
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAboutModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Info size={20} className="text-purple-500" />
                  About the App
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {appInfo ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg text-white font-black text-2xl">
                        A
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Acadamus</h3>
                        <p className="text-slate-500 dark:text-slate-400">Version {appInfo.version}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-2">What's New</h4>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                        {appInfo.changelog}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-2">App Purpose</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {appInfo.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32">
                    <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isRequestsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setIsRequestsModalOpen(false); setSelectedChatUser(null); }}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl h-[100dvh] sm:h-[85vh] flex flex-col liquid-glass-heavy rounded-none sm:rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5 shrink-0 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  {(isAdmin && selectedChatUser) ? (
                    <button onClick={() => setSelectedChatUser(null)} className="mr-2 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                      <span className="text-lg font-black">&larr;</span>
                    </button>
                  ) : (
                    <MessageSquare size={20} className="text-purple-500" />
                  )}
                  {isAdmin ? (selectedChatUser ? `Chat with ${messages.find((m: any) => m.senderEmail === selectedChatUser)?.senderName || selectedChatUser}` : "User Chats") : "Chat with Admin"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsRequestsModalOpen(false); setSelectedChatUser(null); }}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col bg-white/30 dark:bg-black/30">
                {isAdmin && !selectedChatUser ? (
                  <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">

                    {(() => {
                      const userEmails = Array.from(new Set(messages.map((m: any) => m.senderRole === 'user' ? m.senderEmail : m.receiverEmail).filter((e: any) => e !== 'admin')));
                      if (userEmails.length === 0) {
                        return (
                          <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                            <MessageSquare className="mb-3 opacity-50" size={32} />
                            <p>No chats found.</p>
                          </div>
                        );
                      }
                      return userEmails.map(email => {
                        const userMsgs = messages.filter((m: any) => m.senderEmail === email || m.receiverEmail === email);
                        const latestMsg = userMsgs[userMsgs.length - 1];
                        const unreadCount = userMsgs.filter((m: any) => m.senderEmail === email && !m.readByAdmin).length;
                        return (
                          <div 
                            key={email as string} 
                            onClick={() => {
                              setSelectedChatUser(email as string);
                              if (unreadCount > 0) {
                                customFetch('/api/messages/read', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otherUserEmail: email }) })
                                  .then(() => fetchMessages())
                                  .catch(console.error);
                              }
                            }}
                            className="p-4 rounded-2xl bg-white/50 dark:bg-black/50 hover:bg-white/80 dark:hover:bg-black/70 border border-black/5 dark:border-white/5 cursor-pointer transition-colors flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-lg">{latestMsg.senderRole === 'user' ? latestMsg.senderName : (messages.find((m: any) => m.senderEmail === email)?.senderName || email)}</div>
                              <div className="text-sm text-slate-500 truncate max-w-[200px] sm:max-w-md">{latestMsg.text}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-slate-400">{formatTimeAmPm(new Date(latestMsg.timestamp).toLocaleTimeString("en-US", {hour12: false}))}</span>
                              {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col">
                      {messages.filter((m: any) => isAdmin ? (m.senderEmail === selectedChatUser || m.receiverEmail === selectedChatUser) : true).length === 0 ? (
                         <div className="text-center py-10 text-slate-500 m-auto flex flex-col items-center">
                            <MessageSquare className="mb-3 opacity-50" size={32} />
                            <p>Send a message to start chatting.</p>
                            {!isAdmin && <p className="text-xs mt-2 opacity-70">Daily limit: 15 messages.</p>}
                          </div>
                      ) : (
                        messages.filter((m: any) => isAdmin ? (m.senderEmail === selectedChatUser || m.receiverEmail === selectedChatUser) : true).map((msg: any) => {
                          const isMine = isAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'user';
                          return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl p-3 sm:p-4 ${isMine ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-sm border border-black/5 dark:border-white/5'}`}>
                                <div className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${isMine ? 'text-purple-200' : 'text-slate-400'}`}>
                                  {formatTimeAmPm(new Date(msg.timestamp).toLocaleTimeString("en-US", {hour12: false}))}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-black/50 border-t border-black/5 dark:border-white/5 shrink-0">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full px-5 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                          disabled={isSendingMessage}
                        />
                        <button
                          type="submit"
                          disabled={!newMessageText.trim() || isSendingMessage}
                          className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 shrink-0"
                        >
                          <Send size={20} />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isLogsOpen && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLogsOpen(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[80vh] flex flex-col liquid-glass-heavy rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" />
                  Email Reminder Logs
                </h2>
                <button
                  type="button"
                  onClick={() => setIsLogsOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-white/30 dark:bg-black/30">
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Mail className="mx-auto mb-3 opacity-50" size={32} />
                    <p>No reminders have been sent yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">{log.subject}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {log.status === 'success' ? 'Sent' : 'Failed'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          To: {log.teacherEmail}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        {log.details && (
                          <div className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded-lg break-words">
                            {log.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ExamForm 
        isOpen={isExamFormOpen} 
        onClose={() => { setIsExamFormOpen(false); setEditingExamId(null); }} 
        onSubmit={handleExamSubmit} 
        isSubmitting={isSubmittingEntry} 
        examToEdit={exams.find(e => e.id === editingExamId)}
      />
      {/* Floating Chatbot Toggle */}
      <button
        onClick={() => { triggerHaptic(); setIsChatOpen(!isChatOpen); }}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all z-40"
      >
        {isChatOpen ? <Sparkles size={24} className="opacity-0" /> : <Sparkles size={24} />}
      </button>

      <AnimatePresence>
        {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
