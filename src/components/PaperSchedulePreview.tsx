import React from 'react';
import type { ExamEntry, SchoolClass } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

interface PaperSchedulePreviewProps {
  exams: ExamEntry[];
  classes: SchoolClass[];
  isAdmin?: boolean;
  onEdit?: (examId: string) => void;
  onDelete?: (examId: string) => void;
}

export function PaperSchedulePreview({ exams, classes, isAdmin, onEdit, onDelete }: PaperSchedulePreviewProps) {
  if (exams.length === 0) {
    return (
      <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
        No papers scheduled for this type.
      </div>
    );
  }

  // Sort by date then time
  const sortedExams = [...exams].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const formatTimeAmPm = (timeStr: string) => {
    if (!timeStr) return "";
    let [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const getDayOfWeek = (dateStr: string) => {
    const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(dateStr + 'T12:00:00');
    return daysArr[d.getDay()];
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-8">
      <table className="w-full text-sm text-left border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700 w-32">DATE & DAY</th>
            <th className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700 w-40">TIME</th>
            <th className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700">SUBJECT</th>
            
            <th className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700">INVIGILATORS</th>
            {isAdmin && <th className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700 text-center w-24">ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {sortedExams.map((exam) => (
            <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                <div className="font-semibold">{exam.date}</div>
                <div className="text-xs text-slate-500">{getDayOfWeek(exam.date)}</div>
              </td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {formatTimeAmPm(exam.time)} {exam.endTime ? `- ${formatTimeAmPm(exam.endTime)}` : ''}
              </td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">
                {exam.subject.toUpperCase()}
              </td>
              
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                {exam.invigilators && exam.invigilators.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {exam.invigilators.map((inv, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-medium">{inv.name}</span>
                        {inv.email && <span className="text-slate-500 ml-1">({inv.email})</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </td>
              {isAdmin && (
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit?.(exam.id)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete?.(exam.id)} className="p-2 rounded-full hover:bg-red-500/10 text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
