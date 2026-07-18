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

      // Poster-like subtle background
      doc.setFillColor(252, 253, 255); // Very very light blue/gray
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Subtle background shapes
      doc.setFillColor(242, 247, 255); // Very soft blue
      doc.circle(20, 20, 60, 'F'); // Top left
      doc.circle(pageWidth, pageHeight, 80, 'F'); // Bottom right
      
      doc.setFillColor(255, 245, 245); // Very soft pink/red
      doc.circle(pageWidth - 40, 30, 40, 'F'); // Top right

      // Main Content Border
      doc.setLineWidth(1.5);
      doc.setDrawColor(20, 30, 70); // Deep navy border
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setLineWidth(0.3);
      doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

      let startY = 40;
      let logoLoaded = false;

      // Try to load logo.png
      try {
        const img = new Image();
        img.src = '/logo.png'; // Looking for logo.png in public folder
        
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = 45;
            const imgHeight = (img.height * imgWidth) / img.width;
            const xPos = (pageWidth - imgWidth) / 2;
            doc.addImage(img, 'PNG', xPos, 16, imgWidth, imgHeight);
            logoLoaded = true;
            startY = 16 + imgHeight + 6;
            resolve(true);
          };
          img.onerror = () => {
            resolve(false);
          };
          setTimeout(() => resolve(false), 800);
        });
      } catch (e) {
      }
      
      // Header Text
      if (!logoLoaded) {
        doc.setFontSize(30);
        doc.setFont("times", "bolditalic");
        doc.setTextColor(20, 30, 70);
        doc.text("Teach Education System", pageWidth / 2, 26, { align: 'center' });
      }
      
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.setTextColor(100, 110, 130);
      doc.text("ACADEMIC TIMETABLE  |  2026 - 2027", pageWidth / 2, logoLoaded ? startY - 2 : 36, { align: 'center', charSpace: 1 });
      
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
                styles: { halign: 'center', valign: 'middle', fillColor: [250, 252, 255], textColor: [180, 190, 200], fontStyle: 'bold', fontSize: 16 } 
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
        startY: logoLoaded ? startY + 4 : 45,
        head: [
          [{ content: className.toUpperCase() + " SCHEDULE", colSpan: 8, styles: { halign: 'center', fillColor: [20, 30, 70], textColor: 255, fontSize: 16, fontStyle: 'bold' } }], 
          ['TIME/ DAY', ...daysOfWeek.map(d => d.toUpperCase())]
        ],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [225, 235, 250], textColor: [20, 30, 70], halign: 'center', valign: 'middle', lineWidth: 0.5, lineColor: [160, 180, 220] },
        bodyStyles: { halign: 'center', valign: 'middle', textColor: [30, 40, 50], lineWidth: 0.5, lineColor: [210, 220, 235], fontStyle: 'bold', fontSize: 11, fillColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 253, 255] },
        styles: { font: 'times', cellPadding: 5, minCellHeight: 14 }
      });
      
      const lastTableY = (doc as any).lastAutoTable.finalY;
      
      // Footer info box
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.setDrawColor(210, 220, 235);
      doc.roundedRect(15, lastTableY + 6, pageWidth - 30, 20, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.setTextColor(100, 110, 130);
      doc.text("• Kindly be punctual and consult this timetable for daily classes.", 22, lastTableY + 14);
      doc.text("• Reporting time is 15 minutes before the class time.", 22, lastTableY + 20);
      
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 70);
      doc.text(\`Dated: \${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\`, 18, pageHeight - 16);
      doc.text("Administration", pageWidth - 45, pageHeight - 16);
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(20, 30, 70);
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
