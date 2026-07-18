const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const newPdf = `
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
      doc.setDrawColor(0, 0, 128); // Dark blue border
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
      
      // Header
      doc.setFontSize(26);
      doc.setFont("times", "bolditalic");
      doc.setTextColor(0, 0, 128);
      doc.text("Teach Education System", pageWidth / 2, 28, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text("TIME TABLE FOR ACADEMIC YEAR 2026 - 2027", pageWidth / 2, 38, { align: 'center' });
      
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

      const formatTimeAmPm = (time24: string) => {
        const [h, m] = time24.split(':');
        let hours = parseInt(h);
        const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return \`\${hours}:\${m} \${ampm}\`;
      };

      const tableData = timesArray.map(time => {
        const rowData = [formatTimeAmPm(time)];
        daysOfWeek.forEach(day => {
          let cellText = "";
          
          const dayEntries = classEntries.filter(e => e.time === time && (e.days?.includes(day) || e.days?.includes('Daily')));
          if (dayEntries.length > 0) {
            cellText += dayEntries.map(e => e.subject).join("\\n");
          }
          
          const dayExams = classExams.filter(e => {
            if (e.time !== time) return false;
            const dateObj = new Date(e.date);
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            return days[dateObj.getDay()] === day;
          });
          
          if (dayExams.length > 0) {
            if (cellText) cellText += "\\n";
            cellText += dayExams.map(e => \`Assessment\\n(\${e.subject})\`).join("\\n");
          }
          
          if (!cellText) cellText = "OFF";
          rowData.push(cellText);
        });
        return rowData;
      });

      autoTable(doc, {
        startY: 45,
        head: [
          [{ content: className.toUpperCase(), colSpan: 8, styles: { halign: 'center', fillColor: [0, 0, 128], textColor: 255, fontSize: 16, fontStyle: 'bold' } }], 
          ['TIME/ DAY', ...daysOfWeek.map(d => d.toUpperCase())]
        ],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [180, 200, 240], textColor: 0, halign: 'center', valign: 'middle', lineWidth: 0.8, lineColor: 0 },
        bodyStyles: { halign: 'center', valign: 'middle', textColor: 0, lineWidth: 0.8, lineColor: 0, fontStyle: 'bold' },
        styles: { font: 'times', fontStyle: 'bold', cellPadding: 8, minCellHeight: 18 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index > 0) {
             if (data.cell.text[0] === 'OFF') {
                 // You can customize empty cells if you want
             }
          }
        }
      });
      
      const lastTableY = (doc as any).lastAutoTable.finalY;
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(0);
      doc.rect(14, lastTableY + 10, pageWidth - 28, 20);

      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.setTextColor(0, 0, 128);
      doc.text("• Kindly be punctual and consult this timetable for daily classes.", 20, lastTableY + 18);
      doc.text("• Reporting time is 15 minutes before the class time.", 20, lastTableY + 24);
      
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.setTextColor(0, 0, 128);
      doc.text(\`Dated: \${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\`, 14, pageHeight - 16);
      doc.text("Administration", pageWidth - 45, pageHeight - 16);
      
      // Admin line
      doc.setLineWidth(0.5);
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
content = content.replace(regex, newPdf.trim());

fs.writeFileSync('src/App.tsx', content);
