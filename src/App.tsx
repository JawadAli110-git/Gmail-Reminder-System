/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit2, Moon, Sun, Clock, BookOpen, User, Mail, Sparkles, Activity, GraduationCap, Calendar, Download, Printer, List, Calendar as CalendarIcon, FileText } from "lucide-react";
import { Chatbot } from "./components/Chatbot";
import { ExamForm } from "./components/ExamForm";

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
import type { TimetableEntry, EmailLog, SchoolClass, ExamEntry } from "./types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function App() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classesList, setClassesList] = useState<SchoolClass[]>([]);
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<TimetableEntry>>({ days: ["Daily"] });
  const [additionalSessions, setAdditionalSessions] = useState<{day: string, time: string, endTime?: string}[]>([]);
  const [classFormData, setClassFormData] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'class' | 'entry' | 'exam', id: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'error' | 'success'} | null>(null);

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
        const response = await fetch('/logo.jpg');
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
      const classExams = exams.filter(e => !selectedClassId || e.classId === selectedClassId);
      
      // Determine actual days to show
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      const emptyDays = new Set<string>();
      daysOfWeek.forEach(day => {
        const hasClasses = classEntries.some(e => e.days?.includes(day) || e.days?.includes('Daily'));
        const hasExams = classExams.some(e => {
            const dateObj = new Date(e.date);
            const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            return daysArr[dateObj.getDay()] === day;
        });
        if (!hasClasses && !hasExams) emptyDays.add(day);
      });

      const allTimes = new Set<string>();
      classEntries.forEach(e => allTimes.add(e.time));
      classExams.forEach(e => allTimes.add(e.time));
      
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
              cellText += dayEntries.map(e => e.subject.toUpperCase()).join("\n");
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
            
            const dayExams = classExams.filter(e => {
              if (e.time !== time) return false;
              const dateObj = new Date(e.date);
              const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              return daysArr[dateObj.getDay()] === day;
            });
            
            if (dayExams.length > 0) {
              if (cellText) cellText += "\n";
              cellText += dayExams.map(e => `[EXAM]\n${e.subject.toUpperCase()}`).join("\n");
              const examWithEnd = dayExams.find(e => e.endTime);
              if (examWithEnd) {
                  let span = 1;
                  for (let i = rowIndex + 1; i < timesArray.length; i++) {
                      if (timesArray[i] < examWithEnd.endTime) {
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
            margin: { left: 20, right: 20 }
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
      doc.roundedRect(20, lastTableY + 10, pageWidth - 40, 24, 2, 2, 'FD');

      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text("Important Instructions:", 24, lastTableY + 16);
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled class.", 24, lastTableY + 22);
      doc.text("• The administration reserves the right to modify the timetable; please refer to official notice boards for updates.", 24, lastTableY + 28);
      
      // Signature and Date
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`, 20, pageHeight - 20);
      
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.6);
      doc.line(pageWidth - 70, pageHeight - 25, pageWidth - 20, pageHeight - 25);
      doc.text("Principal / Administrator", pageWidth - 45, pageHeight - 20, { align: 'center' });
      
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
    fetchEntries();
    fetchClasses();
    fetchExams();
    fetchSettings();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    triggerHaptic();
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const showToast = (title: string, message: string, type: 'error' | 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const [reminderOffset, setReminderOffset] = useState<number>(15);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.reminderOffset) setReminderOffset(data.reminderOffset);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (offset: number) => {
    try {
      await fetch("/api/settings", {
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

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClassesList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/timetable");
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
      const res = await fetch("/api/logs");
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

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormData.name.trim() || isSubmittingClass) return;
    
    const newClassData = { id: Date.now().toString(), name: classFormData.name.trim() };
    setIsClassFormOpen(false);
    setClassFormData({ name: "" });
    setIsSubmittingClass(true);
    triggerHapticSuccess();
    
    try {
      await fetch("/api/classes", {
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

  const handleDeleteClassClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    setDeleteConfirm({ type: 'class', id });
  };

  const confirmDeleteClass = async (id: string) => {
    try {
      await fetch(`/api/classes/${id}`, { method: "DELETE" });
      await fetchClasses();
      await fetchEntries();
      if (selectedClassId === id) setSelectedClassId(null);
      setDeleteConfirm(null);
    } catch (err) {
      triggerHapticError();
    }
  };

  const handleExamSubmit = async (data: Partial<ExamEntry>) => {
    setIsSubmittingEntry(true);
    triggerHaptic();
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
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
        const res = await fetch(`/api/exams/${raw.id}`, {
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
        const res = await fetch(`/api/timetable/${raw.id}`, {
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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const result = await res.json();
      
      if (!res.ok) {
        showToast("Scheduling Conflict", result.error || "Failed to schedule class.", "error");
        triggerHapticError();
      } else {
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
               const sessionRes = await fetch("/api/timetable", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(sessionData)
               });
               const sessionResult = await sessionRes.json();
               if (!sessionRes.ok) {
                   showToast("Scheduling Conflict", `Failed to schedule extra class on ${session.day}. ${sessionResult.error}`, "error");
               }
            }
        }

        triggerHapticSuccess();
        setIsFormOpen(false);
        setFormData({ days: ["Daily"] });
        setAdditionalSessions([]);
        setEditingId(null);
        showToast("Success", editingId ? "Class updated." : "Class added.", "success");
        await fetchEntries();
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
      await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      await fetchEntries();
      setDeleteConfirm(null);
    } catch (err) {
      triggerHapticError();
    }
  };

  const confirmDeleteExam = async (id: string) => {
    try {
      await fetch(`/api/exams/${id}`, { method: "DELETE" });
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
      const res = await fetch("/api/intelligence", {
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
              {selectedClassId ? (
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedClassId(null)}>
                  <span className="text-blue-600 hover:opacity-80 transition-opacity">&larr;</span>
                  {classesList.find(c => c.id === selectedClassId)?.name} Schedule
                </div>
              ) : "Classes"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-2 text-lg"
            >
              {selectedClassId ? "Manage timetable for this class" : "Select a class to view its schedule"}
            </motion.p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 no-print w-full md:w-auto mt-4 md:mt-0">
            {selectedClassId && (
              <button onClick={exportToPDF} className="p-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm" title="Export to PDF">
                <Printer size={20} />
              </button>
            )}
            
            {!selectedClassId && (
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

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-full liquid-glass shadow-sm shrink-0">
              <Clock size={16} className="text-slate-500" />
              <select
                value={reminderOffset}
                onChange={(e) => updateSettings(Number(e.target.value))}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
                title="Reminder Time"
              >
                <option value={5}>5m before</option>
                <option value={10}>10m before</option>
                <option value={15}>15m before</option>
                <option value={30}>30m before</option>
                <option value={60}>1h before</option>
              </select>
            </div>

            <button
              onClick={toggleTheme}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => {
                triggerHaptic();
                setIsLogsOpen(true);
              }}
              className="p-3 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-black/60 transition-colors shadow-sm shrink-0"
              title="Email Logs"
            >
              <Activity size={20} />
            </button>

            {selectedClassId ? (
              <button
                onClick={() => {
                  triggerHaptic();
                  setEditingId(null);
                  setFormData({});
                  setAdditionalSessions([]);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shrink-0 ml-auto md:ml-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Entry</span>
              </button>
            ) : (
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
            )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {classesList.map((c, idx) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          triggerHaptic();
                          setSelectedClassId(c.id);
                        }}
                        className="liquid-glass rounded-3xl p-6 group relative overflow-hidden text-slate-900 dark:text-white cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <GraduationCap size={24} />
                          </div>
                          <button 
                            onClick={(e) => handleDeleteClassClick(c.id, e)} 
                            className="p-2 rounded-full hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{c.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {entries.filter(e => e.classId === c.id).length} scheduled classes
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
                    <p>No classes available. Create your first class.</p>
                  </div>
                )}

                {/* Global Exams Section */}
                {exams.length > 0 && (
                  <div className="mt-16">
                    <div className="flex items-center gap-3 mb-8">
                      <FileText className="text-red-500" size={24} />
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Scheduled Papers</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {exams.map((exam, idx) => (
                          <motion.div
                            key={`exam-${exam.id}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="liquid-glass rounded-3xl p-6 group relative overflow-hidden text-slate-900 dark:text-white border border-red-500/30"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex gap-2">
                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold tracking-wide">
                                  {formatTimeAmPm(exam.time)}
                                </div>
                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100/50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold tracking-wide">
                                  {exam.date}
                                </div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => { setEditingExamId(exam.id); setIsExamFormOpen(true); }} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm({ type: 'exam', id: exam.id })} className="p-2 rounded-full hover:bg-red-500/10 text-red-500">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="inline-block px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-xs font-bold mb-2 tracking-wider dark:bg-red-900/50 dark:text-red-200 uppercase">Exam / Paper</div>
                            <h3 className="text-xl font-bold mb-1 line-clamp-1">{exam.subject}</h3>
                            
                            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Invigilators</span>
                              {exam.invigilators?.map((inv, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                  <User size={14} className="opacity-70 text-slate-900 dark:text-slate-100" />
                                  <span className="font-medium text-slate-900 dark:text-slate-100">{inv.name}</span>
                                  <span className="text-xs text-slate-500">({inv.email})</span>
                                </div>
                              ))}
                              {(!exam.invigilators || exam.invigilators.length === 0) && (
                                <span className="text-xs text-slate-500">No invigilators assigned</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>
                
                {entries.filter(e => e.classId === selectedClassId).length === 0 && (
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
                Delete {deleteConfirm.type === 'class' ? 'Class' : 'Entry'}?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {deleteConfirm.type === 'class' 
                  ? "Are you sure you want to delete this class? All of its schedule entries will also be permanently deleted."
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
                    else if (deleteConfirm.type === 'entry') confirmDeleteEntry(deleteConfirm.id);
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
