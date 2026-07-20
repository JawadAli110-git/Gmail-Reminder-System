const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldTableDataStr = `      const tableData = timesArray.map((time, rowIndex) => {
        let endTimeStr = "";
        const entryWithTime = classEntries.find(e => e.time === time && e.endTime);
        const examWithTime = classExams.find(e => e.time === time && e.endTime);
        if (entryWithTime?.endTime) endTimeStr = entryWithTime.endTime;
        else if (examWithTime?.endTime) endTimeStr = examWithTime.endTime;
        
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
            let cellText = "";
            const dayEntries = classEntries.filter(e => e.time === time && (e.days?.includes(day) || e.days?.includes('Daily')));
            if (dayEntries.length > 0) {
              cellText += dayEntries.map(e => e.subject.toUpperCase()).join("\\n");
            }
            
            const dayExams = classExams.filter(e => {
              if (e.time !== time) return false;
              const dateObj = new Date(e.date);
              const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              return daysArr[dateObj.getDay()] === day;
            });
            
            if (dayExams.length > 0) {
              if (cellText) cellText += "\\n";
              cellText += dayExams.map(e => \`[EXAM]\\n\${e.subject.toUpperCase()}\`).join("\\n");
            }
            
            if (!cellText) cellText = "-";
            rowData.push(cellText);
          }
        });
        return rowData;
      });`;

const newTableDataStr = `      const skipCells: Record<string, number> = {};
      
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
            
            const dayExams = classExams.filter(e => {
              if (e.time !== time) return false;
              const dateObj = new Date(e.date);
              const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              return daysArr[dateObj.getDay()] === day;
            });
            
            if (dayExams.length > 0) {
              if (cellText) cellText += "\\n";
              cellText += dayExams.map(e => \`[EXAM]\\n\${e.subject.toUpperCase()}\`).join("\\n");
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
      });`;

content = content.replace(oldTableDataStr, newTableDataStr);
fs.writeFileSync('src/App.tsx', content);
