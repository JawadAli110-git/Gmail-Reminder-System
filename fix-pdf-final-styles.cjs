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

      // Clean White Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Elegant minimal border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

      let startY = 46; 
      
      // Logo
      let logoLoaded = false;
      try {
        const img = new Image();
        img.src = '/logo.jpg';
        await new Promise((resolve) => {
          img.onload = () => {
            const imgHeight = 22;
            const imgWidth = (img.width * imgHeight) / img.height;
            doc.addImage(img, 'JPEG', 18, 18, imgWidth, imgHeight);
            logoLoaded = true;
            resolve(true);
          };
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 1000);
        });
      } catch (e) {}

      // Header Content - Clean and modern
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      
      if(logoLoaded) {
         doc.setFontSize(24);
         doc.text("TEACH EDUCATION SYSTEM", pageWidth / 2, 26, { align: 'center' });
         doc.setFontSize(12);
         doc.setTextColor(100, 100, 100);
         doc.setFont("helvetica", "normal");
         doc.text(\`ACADEMIC TIMETABLE - \${className.toUpperCase()}\`, pageWidth / 2, 34, { align: 'center', charSpace: 1 });
      } else {
         doc.setFontSize(26);
         doc.text("TEACH EDUCATION SYSTEM", pageWidth / 2, 28, { align: 'center' });
         doc.setFontSize(13);
         doc.setTextColor(100, 100, 100);
         doc.setFont("helvetica", "normal");
         doc.text(\`ACADEMIC TIMETABLE - \${className.toUpperCase()}\`, pageWidth / 2, 36, { align: 'center', charSpace: 1 });
      }

      // Prepare Data
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
                styles: { halign: 'center', valign: 'middle', fillColor: [248, 249, 250], textColor: [150, 150, 150], fontStyle: 'bold', fontSize: 14 } 
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
              cellText += dayExams.map(e => \`[EXAM]\\n\${e.subject}\`).join("\\n");
            }
            
            if (!cellText) cellText = "-";
            rowData.push(cellText);
          }
        });
        return rowData;
      });

      // Add actual table
      autoTable(doc, {
        startY: startY,
        head: [['TIME', ...daysOfWeek.map(d => d.toUpperCase())]],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [240, 240, 240], 
          textColor: [40, 40, 40], 
          halign: 'center', 
          valign: 'middle', 
          fontStyle: 'bold', 
          fontSize: 10,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        bodyStyles: { 
          halign: 'center', 
          valign: 'middle', 
          textColor: [60, 60, 60], 
          fontSize: 10, 
          fontStyle: 'normal',
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        alternateRowStyles: { 
          fillColor: [252, 252, 252] 
        },
        styles: { 
          font: 'helvetica', 
          cellPadding: 6 
        },
        margin: { left: 16, right: 16 }
      });
      
      const lastTableY = (doc as any).lastAutoTable.finalY;
      
      // Footer
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text("Instructions:", 16, lastTableY + 12);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("1. All students must be present 15 minutes prior to their scheduled class.", 16, lastTableY + 17);
      doc.text("2. Timetable is subject to change. Please refer to official notice boards for updates.", 16, lastTableY + 22);
      
      doc.setFontSize(9);
      doc.text(\`Issue Date: \${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}\`, 16, pageHeight - 16);
      
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.line(pageWidth - 65, pageHeight - 20, pageWidth - 16, pageHeight - 20);
      doc.text("Principal / Administrator", pageWidth - 40, pageHeight - 15, { align: 'center' });
      
      doc.save(\`\${className}_Timetable.pdf\`);
      setToastMessage({ title: "Success", message: "PDF Downloaded", type: "success" });
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
