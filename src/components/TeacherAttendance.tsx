import React, { useState, useEffect } from "react";
import { SchoolClass, TimetableEntry, TeacherAttendanceRecord } from "../types";
import { motion } from "motion/react";
import { Download, Save, Check, X, User, Eye, Edit2 } from "lucide-react";
import * as XLSX from "xlsx";
import { triggerHaptic, triggerHapticSuccess, triggerHapticError } from "../lib/haptics";

interface Props {
  classes: SchoolClass[];
  timetableEntries: TimetableEntry[];
}

export function TeacherAttendance({ classes, timetableEntries }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  
  const [fetchedRecord, setFetchedRecord] = useState<TeacherAttendanceRecord | null>(null);
  const [editData, setEditData] = useState<TeacherAttendanceRecord | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState<string>(new Date().toISOString().substring(0, 7));

  // Determine teachers for selected class & day
  const expectedTeachers = React.useMemo(() => {
    if (!selectedClassId || !selectedDate) return [];
    
    // Parse date safely in local time zone to avoid UTC offset issues
    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[dateObj.getDay()];

    const classEntries = timetableEntries.filter(
      (e) => e.classId === selectedClassId && (e.days?.includes(dayOfWeek) || e.days?.includes("Daily"))
    );

    // Get unique teachers
    const teachersMap = new Map<string, { name: string, subject: string, taName?: string, taEmail?: string }>();
    classEntries.forEach((e) => {
      if (!teachersMap.has(e.teacherEmail)) {
        teachersMap.set(e.teacherEmail, { name: e.teacherName, subject: e.subject, taName: e.taName, taEmail: e.taEmail });
      }
    });

    return Array.from(teachersMap.entries()).map(([email, data]) => ({
      teacherEmail: email,
      teacherName: data.name,
      originalTeacherEmail: email,
      originalTeacherName: data.name,
      taName: data.taName,
      taEmail: data.taEmail,
      subject: data.subject,
    }));
  }, [selectedClassId, selectedDate, timetableEntries]);

  const fetchAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      const res = await fetch(`/api/teacher-attendance?date=${selectedDate}&classId=${selectedClassId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: TeacherAttendanceRecord[] = await res.json();
        if (data && data.length > 0) {
          const fetched = data[0];
          // Enrich with latest TA details from timetable in case they were updated or missing
          const enrichedTeachers = fetched.teachers.map(recordTeacher => {
            const expected = expectedTeachers.find(et => et.originalTeacherEmail === (recordTeacher.originalTeacherEmail || recordTeacher.teacherEmail));
            if (expected) {
              return {
                ...recordTeacher,
                originalTeacherEmail: expected.originalTeacherEmail,
                originalTeacherName: expected.originalTeacherName,
                taName: expected.taName,
                taEmail: expected.taEmail,
                role: recordTeacher.role || 'Teacher'
              };
            }
            return { ...recordTeacher, role: recordTeacher.role || 'Teacher' };
          });
          const enrichedRecord = { ...fetched, teachers: enrichedTeachers };
          
          setFetchedRecord(enrichedRecord);
          setEditData(enrichedRecord); // pre-fill edit form with existing data
        } else {
          setFetchedRecord(null);
          // Pre-fill empty edit data if expected teachers exist
          setEditData({
            id: `${selectedDate}_${selectedClassId}`,
            date: selectedDate,
            classId: selectedClassId,
            teachers: expectedTeachers.map(t => ({
              ...t,
              role: 'Teacher',
              status: 'Present',
              replacementName: "",
              replacementSubject: ""
            }))
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedClassId, timetableEntries]);

  // Update editData if expectedTeachers changes and we don't have a fetched record
  useEffect(() => {
    if (!fetchedRecord && expectedTeachers.length > 0) {
      setEditData({
        id: `${selectedDate}_${selectedClassId}`,
        date: selectedDate,
        classId: selectedClassId,
        teachers: expectedTeachers.map(t => ({
          ...t,
          role: 'Teacher',
          status: 'Present',
          replacementName: "",
          replacementSubject: ""
        }))
      });
    } else if (!fetchedRecord && expectedTeachers.length === 0) {
      setEditData(null);
    }
  }, [expectedTeachers, fetchedRecord, selectedDate, selectedClassId]);


  const handleStatusChange = (email: string, status: 'Present' | 'Absent' | 'Late' | 'Replace') => {
    if (!editData) return;
    setEditData({
      ...editData,
      teachers: editData.teachers.map(t => 
        t.teacherEmail === email ? { ...t, status, replacementName: status !== 'Replace' ? '' : t.replacementName, replacementSubject: status !== 'Replace' ? '' : t.replacementSubject } : t
      )
    });
  };

  const handleRoleChange = (email: string, role: 'Teacher' | 'TA') => {
    if (!editData) return;
    setEditData({
      ...editData,
      teachers: editData.teachers.map(t => {
        const idToMatch = t.originalTeacherEmail || t.teacherEmail;
        if (idToMatch === email) {
          const isTA = role === 'TA';
          return {
            ...t,
            role,
            teacherName: isTA && t.taName ? t.taName : (t.originalTeacherName || t.teacherName),
            teacherEmail: isTA && t.taEmail ? t.taEmail : (t.originalTeacherEmail || t.teacherEmail),
          };
        }
        return t;
      })
    });
  };

  const handleReplacementChange = (email: string, field: 'replacementName' | 'replacementSubject', value: string) => {
    if (!editData) return;
    setEditData({
      ...editData,
      teachers: editData.teachers.map(t => 
        t.teacherEmail === email ? { ...t, [field]: value } : t
      )
    });
  };

  const saveAttendance = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      const res = await fetch(`/api/teacher-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        triggerHapticSuccess();
        alert("Attendance saved successfully!");
        fetchAttendance(); // refresh
        setMode('view');
      } else {
        triggerHapticError();
        alert("Failed to save attendance.");
      }
    } catch (e) {
      triggerHapticError();
    } finally {
      setSaving(false);
    }
  };

  const downloadMonthlyReport = () => {
    setReportMonth(selectedDate.substring(0, 7));
    setShowReportModal(true);
  };

  const generateMonthlyReport = async () => {
    if (!reportMonth) return;
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      const res = await fetch(`/api/teacher-attendance?month=${reportMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: TeacherAttendanceRecord[] = await res.json();
        if (data.length === 0) {
          alert("No records found for this month.");
          return;
        }

        const wb = XLSX.utils.book_new();

        const classesMap = new Set(data.map(d => d.classId));

        classesMap.forEach(cId => {
          const className = classes.find(c => c.id === cId)?.name || cId;
          const classData = data.filter(d => d.classId === cId);

          const teacherStats = new Map<string, { 
            name: string, 
            email: string, 
            totalClasses: number, 
            present: number, 
            late: number, 
            absent: number, 
            replace: number 
          }>();

          classData.forEach(record => {
            record.teachers.forEach(t => {
              const key = t.teacherEmail;
              if (!teacherStats.has(key)) {
                teacherStats.set(key, { name: t.teacherName, email: t.teacherEmail, totalClasses: 0, present: 0, late: 0, absent: 0, replace: 0 });
              }
              const stats = teacherStats.get(key)!;
              stats.totalClasses += 1;
              if (t.status === 'Present') stats.present += 1;
              if (t.status === 'Late') stats.late += 1;
              if (t.status === 'Absent') stats.absent += 1;
              if (t.status === 'Replace') stats.replace += 1;
            });
          });

          const rows = Array.from(teacherStats.values()).map(stats => ({
            'Teacher Name': stats.name,
            'Email': stats.email,
            'Total Classes': stats.totalClasses,
            'Total Present': stats.present,
            'Total Late': stats.late,
            'Total Absent': stats.absent,
            'Total Replaced': stats.replace
          }));

          const ws = XLSX.utils.json_to_sheet(rows);
          
          ws['!cols'] = [
            {wch: 25}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}
          ];

          XLSX.utils.book_append_sheet(wb, ws, className.substring(0, 31));
        });

        XLSX.writeFile(wb, `Teacher_Attendance_Summary_${reportMonth}.xlsx`);
        setShowReportModal(false);
      }
    } catch (e) {
      alert("Failed to download report");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Teacher Attendance</h2>
        <button
          onClick={downloadMonthlyReport}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Download size={18} />
          <span>Monthly Report</span>
        </button>
      </div>

      <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          >
            <option value="">-- Select a Class --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => { triggerHaptic(); setMode('view'); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${mode === 'view' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          <Eye size={18} />
          View Attendance
        </button>
        <button 
          onClick={() => { triggerHaptic(); setMode('edit'); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${mode === 'edit' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          <Edit2 size={18} />
          Mark / Update
        </button>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Generate Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Month</label>
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                This will generate a teacher-wise summary for the entire month, including total classes, present, absent, late, and replaced counts.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={generateMonthlyReport}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                Generate
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading attendance data...</div>
      ) : selectedClassId && selectedDate ? (
        
        mode === 'view' ? (
          // VIEW MODE
          fetchedRecord && fetchedRecord.teachers.length > 0 ? (
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Attendance Log</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-medium">Recorded</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                      <th className="p-4 font-medium">Teacher Name</th>
                      <th className="p-4 font-medium">Subject</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Replacement Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetchedRecord.teachers.map((teacher, idx) => (
                      <tr key={teacher.teacherEmail + idx} className="border-b border-slate-200 dark:border-white/5">
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {teacher.teacherName} {teacher.role === 'TA' ? '(TA)' : ''}
                          </div>
                          <div className="text-sm text-slate-500">{teacher.teacherEmail}</div>
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">{teacher.subject}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${teacher.status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 
                              teacher.status === 'Absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 
                              teacher.status === 'Late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 
                              'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'}`}>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {teacher.status === 'Replace' ? (
                            <div className="text-sm">
                              <span className="font-medium text-slate-900 dark:text-white">{teacher.replacementName || 'N/A'}</span>
                              <span className="text-slate-500 dark:text-slate-400 mx-1">•</span>
                              <span className="text-slate-600 dark:text-slate-300">{teacher.replacementSubject || 'N/A'}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl">
              <Check size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Records Found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Attendance has not been logged for this date yet.</p>
              <button 
                onClick={() => setMode('edit')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Mark Attendance Now
              </button>
            </div>
          )
        ) : (
          // EDIT MODE
          editData && editData.teachers.length > 0 ? (
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Mark / Update Attendance</h3>
                {!fetchedRecord && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full text-sm font-medium">Not Saved Yet</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                      <th className="p-4 font-medium">Teacher Name</th>
                      <th className="p-4 font-medium">Subject</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Replacement Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editData.teachers.map((teacher, idx) => (
                      <tr key={(teacher.originalTeacherEmail || teacher.teacherEmail) + idx} className="border-b border-slate-200 dark:border-white/5">
                        <td className="p-4">
                          {teacher.taName ? (
                            <select
                              value={teacher.role || 'Teacher'}
                              onChange={(e) => handleRoleChange(teacher.originalTeacherEmail || teacher.teacherEmail, e.target.value as 'Teacher' | 'TA')}
                              className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 w-full"
                            >
                              <option value="Teacher">{teacher.originalTeacherName || teacher.teacherName} (Teacher)</option>
                              <option value="TA">{teacher.taName} (TA)</option>
                            </select>
                          ) : (
                            <div className="font-medium text-slate-900 dark:text-white mb-2">{teacher.teacherName}</div>
                          )}
                          <div className="text-sm text-slate-500">{teacher.teacherEmail}</div>
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">{teacher.subject}</td>
                        <td className="p-4">
                          <select
                            value={teacher.status}
                            onChange={(e) => handleStatusChange(teacher.teacherEmail, e.target.value as any)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 
                              ${teacher.status === 'Present' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' : 
                                teacher.status === 'Absent' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' : 
                                teacher.status === 'Late' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' : 
                                'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50'}`}
                          >
                            <option value="Present" className="text-black bg-white dark:text-white dark:bg-slate-800">Present</option>
                            <option value="Late" className="text-black bg-white dark:text-white dark:bg-slate-800">Late</option>
                            <option value="Absent" className="text-black bg-white dark:text-white dark:bg-slate-800">Absent</option>
                            <option value="Replace" className="text-black bg-white dark:text-white dark:bg-slate-800">Replace</option>
                          </select>
                        </td>
                        <td className="p-4">
                          {teacher.status === 'Replace' ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                placeholder="Replacement Name"
                                value={teacher.replacementName || ''}
                                onChange={(e) => handleReplacementChange(teacher.teacherEmail, 'replacementName', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                              />
                              <input
                                type="text"
                                placeholder="Replacement Subject"
                                value={teacher.replacementSubject || ''}
                                onChange={(e) => handleReplacementChange(teacher.teacherEmail, 'replacementSubject', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex justify-end">
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : <><Save size={18} /> Save Attendance</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl">
              <User size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Classes Today</h3>
              <p className="text-slate-500 dark:text-slate-400">There are no teachers scheduled for this class on the selected day.</p>
            </div>
          )
        )
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Please select a date and a class to view and mark attendance.
        </div>
      )}
    </div>
  );
}
