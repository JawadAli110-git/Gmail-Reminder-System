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

      // Outer border
      doc.setLineWidth(1);
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

      let startY = 45;
      
      // Attempt to load logo from public folder
      let logoLoaded = false;
      try {
        const img = new Image();
        img.src = '/logo.png'; // User will upload logo.png to public/
        
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = 40;
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(img, 'PNG', 15, 15, imgWidth, imgHeight);
            logoLoaded = true;
            if (15 + imgHeight + 5 > startY) {
              startY = 15 + imgHeight + 5;
            }
            resolve(true);
          };
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 1000); // 1s timeout
        });
      } catch (e) {
        // Ignore image errors
      }
      
      // Header Text
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Teach Education System", pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("ACADEMIC TIMETABLE", pageWidth / 2, 33, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.text(\`Class: \${className}\`, pageWidth / 2, 40, { align: 'center' });

      // Prepare Data
      const classEntries = entries.filter(e => e.classId === selectedClassId);
      const classExams = exams.filter(e => !selectedClassId || e.classId === selectedClassId);
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
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

      const tableData = timesArray.map((time) => {
        const rowData: any[] = [formatTimeAmPm(time)];
        daysOfWeek.forEach(day => {
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
              cellText += dayExams.map(e => \`[Exam] \\n\${e.subject}\`).join("\\n");
            }
            
            if (!cellText) cellText = "-";
            rowData.push(cellText);
        });
        return rowData;
      });

      autoTable(doc, {
        startY: startY,
        head: [['TIME', ...daysOfWeek.map(d => d.toUpperCase())]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], halign: 'center', valign: 'middle', fontStyle: 'bold', lineWidth: 0.5, lineColor: [0,0,0] },
        bodyStyles: { halign: 'center', valign: 'middle', textColor: [0, 0, 0], lineWidth: 0.5, lineColor: [0,0,0], fontSize: 10, fontStyle: 'bold' },
        styles: { font: 'helvetica', cellPadding: 4 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });
      
      const lastTableY = (doc as any).lastAutoTable.finalY;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Notes:", 15, lastTableY + 10);
      doc.text("1. Students must be present 15 minutes before the first class.", 15, lastTableY + 16);
      doc.text("2. This timetable is subject to change. Please consult the administration for updates.", 15, lastTableY + 22);
      
      doc.setFont("helvetica", "bold");
      doc.text(\`Date: \${new Date().toLocaleDateString()}\`, 15, pageHeight - 15);
      doc.text("Principal / Administrator Signature _______________________", pageWidth - 90, pageHeight - 15);
      
      doc.save(\`\${className}_Timetable.pdf\`);
      setToastMessage({ title: "Success", message: "PDF Downloaded successfully", type: "success" });
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
