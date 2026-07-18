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

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Premium Border (Navy + Gold)
      doc.setDrawColor(15, 30, 60); // Deep Navy
      doc.setLineWidth(1.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setDrawColor(212, 175, 55); // Gold
      doc.setLineWidth(0.5);
      doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

      let startY = 48; // Space for header
      
      // Logo
      let logoLoaded = false;
      try {
        const img = new Image();
        img.src = '/logo.jpg';
        await new Promise((resolve) => {
          img.onload = () => {
            const imgHeight = 25;
            const imgWidth = (img.width * imgHeight) / img.height;
            doc.addImage(img, 'JPEG', 18, 16, imgWidth, imgHeight);
            logoLoaded = true;
            resolve(true);
          };
          img.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 1000);
        });
      } catch (e) {}

      // Header Content
      doc.setTextColor(15, 30, 60); // Navy
      doc.setFont("helvetica", "bold");
      
      if(logoLoaded) {
         doc.setFontSize(26);
         doc.text("TEACH EDUCATION SYSTEM", pageWidth / 2, 24, { align: 'center' });
         doc.setFontSize(12);
         doc.setTextColor(100, 100, 100);
         doc.setFont("helvetica", "bold");
         doc.text("ACADEMIC TIMETABLE - " + className.toUpperCase(), pageWidth / 2, 32, { align: 'center' });
         
         // Gold separator line
         doc.setDrawColor(212, 175, 55);
         doc.setLineWidth(0.5);
         doc.line(pageWidth/2 - 40, 36, pageWidth/2 + 40, 36);
      } else {
         doc.setFontSize(28);
         doc.text("TEACH EDUCATION SYSTEM", pageWidth / 2, 26, { align: 'center' });
         doc.setFontSize(14);
         doc.setTextColor(100, 100, 100);
         doc.text("ACADEMIC TIMETABLE - " + className.toUpperCase(), pageWidth / 2, 34, { align: 'center' });
      }

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
              cellText += dayExams.map(e => \`[EXAM]\\n\${e.subject}\`).join("\\n");
            }
            
            if (!cellText) cellText = "-";
            rowData.push(cellText);
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
          fillColor: [15, 30, 60], // Navy
          textColor: [255, 255, 255], 
          halign: 'center', 
          valign: 'middle', 
          fontStyle: 'bold', 
          fontSize: 11,
          lineColor: [255, 255, 255],
          lineWidth: 0.1
        },
        bodyStyles: { 
          halign: 'center', 
          valign: 'middle', 
          textColor: [40, 40, 40], 
          fontSize: 10, 
          fontStyle: 'bold',
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        styles: { 
          font: 'helvetica', 
          cellPadding: 5 
        },
        margin: { left: 16, right: 16 }
      });
      
      const lastTableY = (doc as any).lastAutoTable.finalY;
      
      // Footer Notes Block
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.roundedRect(16, lastTableY + 8, pageWidth - 32, 20, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 30, 60);
      doc.text("Important Instructions:", 20, lastTableY + 14);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled class or examination.", 20, lastTableY + 19);
      doc.text("• The administration reserves the right to modify the timetable; please refer to official notice boards for updates.", 20, lastTableY + 24);
      
      // Signatures
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 30, 60);
      doc.text(\`Issue Date: \${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}\`, 16, pageHeight - 16);
      
      doc.setDrawColor(15, 30, 60);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 65, pageHeight - 20, pageWidth - 16, pageHeight - 20);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Principal / Administrator", pageWidth - 40, pageHeight - 15, { align: 'center' });
      
      doc.save(\`\${className}_Premium_Timetable.pdf\`);
      setToastMessage({ title: "Success", message: "Premium PDF Downloaded", type: "success" });
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
