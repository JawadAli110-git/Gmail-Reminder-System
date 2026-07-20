import React from 'react';
import type { TimetableEntry, ExamEntry } from '../types';

export function TimetablePreview({ classEntries, classExams }: { classEntries: TimetableEntry[], classExams: ExamEntry[] }) {
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

  const formatTimeAmPm = (timeStr: string) => {
    if (!timeStr) return "";
    let [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const skipCells: Record<string, number> = {};

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-8">
      <table className="w-full text-sm text-left border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700 text-center w-28">TIME</th>
            {daysOfWeek.map(day => (
              <th key={day} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-3 border border-slate-200 dark:border-slate-700 text-center uppercase">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timesArray.map((time, rowIndex) => (
            <tr key={time}>
              <td className="font-bold text-center p-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {formatTimeAmPm(time)}
              </td>
              {daysOfWeek.map(day => {
                if (emptyDays.has(day)) {
                  if (rowIndex === 0) {
                    return (
                      <td key={day} rowSpan={timesArray.length} className="text-center font-bold text-slate-300 dark:text-slate-600 tracking-widest border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        O F F
                      </td>
                    );
                  }
                  return null;
                }

                if (skipCells[day] > 0) {
                  skipCells[day]--;
                  return null;
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
                  return (
                    <td key={day} className="text-center p-3 border border-slate-200 dark:border-slate-700 text-slate-500">
                      -
                    </td>
                  );
                } else {
                  if (maxRowSpan > 1) {
                    skipCells[day] = maxRowSpan - 1;
                  }
                  return (
                    <td key={day} rowSpan={maxRowSpan > 1 ? maxRowSpan : undefined} className="text-center font-semibold p-3 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                      {cellText}
                    </td>
                  );
                }
              })}
            </tr>
          ))}
          {timesArray.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center p-8 text-slate-500 dark:text-slate-400">
                No scheduled entries for this class
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
