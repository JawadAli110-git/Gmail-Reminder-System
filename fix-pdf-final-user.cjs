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

      // VIP Border - Outer border bold
      doc.setDrawColor(20, 30, 60); // Deep Navy
      doc.setLineWidth(3);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setDrawColor(20, 30, 60); 
      doc.setLineWidth(0.8);
      doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

      let startY = 48; 
      
      // Logo
      let logoLoaded = false;
      try {
        const img = new Image();
        img.src = '/logo.jpg';
        await new Promise((resolve) => {
          img.onload = () => {
            const imgHeight = 22;
            const imgWidth = (img.width * imgHeight) / img.height;
            // Place logo
            doc.addImage(img, 'JPEG', 18, 18, imgWidth, imgHeight);
            logoLoaded = true;
            resolve(true);
          };
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 1000);
        });
      } catch (e) {}

      // Header Content - Centered
      doc.setTextColor(20, 30, 60);
      doc.setFont("times", "bold");
      
      doc.setFontSize(28);
      doc.text("TEACH EDUCATION SYSTEM", pageWidth / 2, 28, { align: 'center' });
      
      // Elegant Gold Separator
      doc.setDrawColor(212, 175, 55); // Gold
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 60, 32, pageWidth / 2 + 60, 32);
      
      doc.setFontSize(14);
      doc.setTextColor(80, 80, 80);
      doc.setFont("times", "bold");
      // Align exact center
      doc.text(\`ACADEMIC TIMETABLE - \${className.toUpperCase()}\`, pageWidth / 2, 39, { align: 'center', charSpace: 1.5 });

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
        const rowData: any[] = [{ content: formatTimeAmPm(time), styles: { cellWidth: 25 } }];
        daysOfWeek.forEach(day => {
          if (emptyDays.has(day)) {
            if (rowIndex === 0) {
              // The "OFF" cell - adjusted font size
              rowData.push({ 
                content: "O F F", 
                rowSpan: timesArray.length, 
                styles: { 
                    halign: 'center', 
                    valign: 'middle', 
                    fillColor: [248, 250, 252], 
                    textColor: [180, 190, 200], 
                    fontStyle: 'bold', 
                    fontSize: 14,
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
      });

      // Add actual table
      if (timesArray.length > 0) {
          autoTable(doc, {
            startY: startY,
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
              lineWidth: 0.4
            },
            bodyStyles: { 
              halign: 'center', 
              valign: 'middle', 
              textColor: [30, 30, 30], 
              fontSize: 8, 
              fontStyle: 'bold',
              lineColor: [60, 70, 90], // more prominent margins/lines
              lineWidth: 0.3,
              cellPadding: 3,
            },
            alternateRowStyles: { 
              fillColor: [248, 249, 251] 
            },
            styles: { 
              font: 'times', 
              overflow: 'linebreak', // Allow long subjects to wrap properly
              halign: 'center',
              valign: 'middle'
            },
            margin: { left: 18, right: 18 }
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
      doc.setLineWidth(0.3);
      doc.roundedRect(18, lastTableY + 8, pageWidth - 36, 22, 2, 2, 'FD');

      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text("Important Instructions:", 22, lastTableY + 14);
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled class.", 22, lastTableY + 20);
      doc.text("• The administration reserves the right to modify the timetable; please refer to official notice boards for updates.", 22, lastTableY + 25);
      
      // Signature and Date
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text(\`Issue Date: \${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}\`, 18, pageHeight - 18);
      
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 65, pageHeight - 22, pageWidth - 18, pageHeight - 22);
      doc.text("Principal / Administrator", pageWidth - 42, pageHeight - 17, { align: 'center' });
      
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
