const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const exportPdfFunc = `
  const exportToPDF = async () => {
    triggerHaptic();
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
      const currentClass = classesList.find(c => c.id === selectedClassId);
      const className = currentClass ? currentClass.name : "CLASS";
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Poster-like Background Elements (Subtle)
      doc.setFillColor(245, 248, 255); // Very light blue
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      doc.setFillColor(230, 240, 255);
      doc.circle(20, 20, 40, 'F');
      doc.circle(pageWidth - 20, pageHeight - 20, 60, 'F');
      
      doc.setFillColor(255, 245, 245);
      doc.circle(pageWidth - 40, 30, 35, 'F');
      
      doc.setFillColor(250, 250, 255);
      doc.circle(40, pageHeight - 10, 50, 'F');

      // Watermark
      doc.setTextColor(230, 235, 250);
      doc.setFontSize(120);
      doc.setFont("times", "bold");
      // rotate is not directly supported in all jsPDF versions simply, we will just put it in background
      doc.text("TEACH", pageWidth / 2, pageHeight / 2 + 20, { align: 'center', angle: 45 } as any);

      // Outer border
      doc.setLineWidth(1.5);
      doc.setDrawColor(30, 58, 138); // Deeper blue
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setLineWidth(0.5);
      doc.rect(13, 13, pageWidth - 26, pageHeight - 26);
      
      // Header Text
      doc.setFontSize(32);
      doc.setFont("times", "bolditalic");
      doc.setTextColor(30, 58, 138);
      doc.text("Teach Education System", pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("ACADEMIC TIMETABLE  |  2026 - 2027", pageWidth / 2, 42, { align: 'center' });
      
      const classEntries = entries.filter(e => e.classId === selectedClassId);
      const classExams = exams.filter(e => !selectedClassId || e.classId === selectedClassId);

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
           const match = t.match(/(\\d+):(\\d+)\\s*(am|pm|a.m.|p.m.)?/i);
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

      const tableData = timesArray.map((time, rowIndex) => {
        const rowData: any[] = [formatTimeAmPm(time)];
        daysOfWeek.forEach(day => {
          if (emptyDays.has(day)) {
            if (rowIndex === 0) {
              rowData.push({ 
                content: "OFF", 
                rowSpan: timesArray.length, 
                styles: { halign: 'center', valign: 'middle', fillColor: [248, 250, 252], textColor: [148, 163, 184], fontStyle: 'bolditalic', fontSize: 24 } 
              });
            }
          } else {
            let cellText = "";
            
            const dayEntries = classEntries.filter(e => e.time === time && (e.days?.includes(day) || e.days?.includes('Daily')));
            if (dayEntries.length > 0) {
              cellText += dayEntries.map(e => e.subject).join("\\n");
            }
            
            const dayExams = classExams.filter(e => {
              if (e.time !== time) return false;
              const dateObj = new Date(e.date);
              const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              return daysArr[dateObj.getDay()] === day;
            });
            
            if (dayExams.length > 0) {
              if (cellText) cellText += "\\n";
              cellText += dayExams.map(e => \`Exam: \\n\${e.subject}\`).join("\\n");
            }
            
            if (!cellText) cellText = "-";
            rowData.push(cellText);
          }
        });
        return rowData;
      });

      autoTable(doc, {
        startY: 50,
        head: [
          [{ content: className.toUpperCase() + " SCHEDULE", colSpan: 8, styles: { halign: 'center', fillColor: [30, 58, 138], textColor: 255, fontSize: 18, fontStyle: 'bold' } }], 
          ['TIME/ DAY', ...daysOfWeek.map(d => d.toUpperCase())]
        ],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [219, 234, 254], textColor: [30, 58, 138], halign: 'center', valign: 'middle', lineWidth: 0.5, lineColor: [147, 197, 253] },
        bodyStyles: { halign: 'center', valign: 'middle', textColor: [15, 23, 42], lineWidth: 0.5, lineColor: [226, 232, 240], fontStyle: 'bold', fillColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { font: 'times', fontStyle: 'bold', cellPadding: 6, minCellHeight: 18 }
      });
      
      const lastTableY = (doc as any).lastAutoTable.finalY;
      
      // Footer info box
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(15, lastTableY + 8, pageWidth - 30, 22, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text("• Kindly be punctual and consult this timetable for daily classes.", 22, lastTableY + 16);
      doc.text("• Reporting time is 15 minutes before the class time.", 22, lastTableY + 22);
      
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(30, 58, 138);
      doc.text(\`Dated: \${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\`, 18, pageHeight - 16);
      doc.text("Administration", pageWidth - 45, pageHeight - 16);
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(30, 58, 138);
      doc.line(pageWidth - 50, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      doc.save(\`\${className}-Timetable.pdf\`);
      setToastMessage({ title: "Success", message: "PDF downloaded successfully", type: "success" });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("PDF Export failed", error);
      setToastMessage({ title: "Error", message: "Failed to generate PDF", type: "error" });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };
`;

const regex = /const exportToPDF = async \(\) => \{[\s\S]*?setTimeout\(\(\) => setToastMessage\(null\), 3000\);\n    \}\n  \};/;
content = content.replace(regex, exportPdfFunc.trim());

fs.writeFileSync('src/App.tsx', content);
