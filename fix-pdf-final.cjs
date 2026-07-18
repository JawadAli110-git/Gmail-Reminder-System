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

      // Set clean white background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Outer border (single, clean)
      doc.setLineWidth(0.5);
      doc.setDrawColor(50, 50, 50);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      let startY = 35; // default startY for table
      
      // Load logo if exists
      let logoLoaded = false;
      try {
        const img = new Image();
        img.src = '/logo.png'; // Make sure this is uploaded to the root
        
        await new Promise((resolve) => {
          img.onload = () => {
            // Add image at top center
            const imgWidth = 40;
            const imgHeight = (img.height * imgWidth) / img.width;
            const xPos = (pageWidth - imgWidth) / 2;
            doc.addImage(img, 'PNG', xPos, 15, imgWidth, imgHeight);
            logoLoaded = true;
            startY = 15 + imgHeight + 10;
            resolve(true);
          };
          img.onerror = () => {
            resolve(false);
          };
          setTimeout(() => resolve(false), 800);
        });
      } catch (e) {
        // Fallback silently
      }
      
      // Header Text
      if (!logoLoaded) {
        doc.setFontSize(24);
        doc.setFont("times", "bolditalic");
        doc.setTextColor(30, 58, 138);
        doc.text("Teach Education System", pageWidth / 2, 25, { align: 'center' });
      }
      
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text("ACADEMIC TIMETABLE", pageWidth / 2, logoLoaded ? startY - 4 : 34, { align: 'center' });
      
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
                styles: { halign: 'center', valign: 'middle', fillColor: [248, 250, 252], textColor: [148, 163, 184], fontStyle: 'italic', fontSize: 11 } 
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
        startY: logoLoaded ? startY + 2 : 40,
        head: [
          [{ content: className.toUpperCase() + " SCHEDULE", colSpan: 8, styles: { halign: 'center', fillColor: [30, 58, 138], textColor: 255, fontSize: 14, fontStyle: 'bold' } }], 
          ['TIME/ DAY', ...daysOfWeek.map(d => d.toUpperCase())]
        ],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [219, 234, 254], textColor: [30, 58, 138], halign: 'center', valign: 'middle', lineWidth: 0.2, lineColor: [200, 200, 200] },
        bodyStyles: { halign: 'center', valign: 'middle', textColor: [15, 23, 42], lineWidth: 0.2, lineColor: [226, 232, 240], fontStyle: 'normal', fontSize: 10, fillColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { font: 'times', cellPadding: 4, minCellHeight: 12 }
      });
      
      const lastTableY = (doc as any).lastAutoTable.finalY;
      
      // Footer info
      doc.setFontSize(9);
      doc.setFont("times", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("• Kindly be punctual and consult this timetable for daily classes.", 15, lastTableY + 8);
      doc.text("• Reporting time is 15 minutes before the class time.", 15, lastTableY + 13);
      
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      doc.setTextColor(30, 58, 138);
      doc.text(\`Dated: \${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\`, 15, pageHeight - 14);
      doc.text("Administration", pageWidth - 35, pageHeight - 14);
      
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
