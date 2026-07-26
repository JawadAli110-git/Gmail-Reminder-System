import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert import
content = content.replace(
  'import { TimetablePreview } from "./components/TimetablePreview";',
  'import { TimetablePreview } from "./components/TimetablePreview";\nimport { PaperSchedulePreview } from "./components/PaperSchedulePreview";'
);

// We need to rewrite exportToPDF completely or just add exportPaperScheduleToPDF and map the buttons correctly.
// Let's add exportPaperScheduleToPDF right after exportToPDF.
const newPdfLogic = `
  const exportPaperScheduleToPDF = async () => {
    triggerHaptic();
    try {
      const doc = new jsPDF('p', 'mm', 'a4'); // Portrait
      const currentType = paperTypes.find(t => t.id === selectedPaperTypeId);
      const typeName = currentType ? currentType.name : "EXAM";
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(1);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.setDrawColor(20, 30, 60); 
      doc.setLineWidth(0.5);
      doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

      let startY = 48; 
      
      try {
        const response = await customFetch('/logo.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        const base64data = await new Promise((resolve) => {
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result);
        });
        doc.addImage(base64data as string, 'JPEG', pageWidth / 2 - 20, 20, 40, 24);
      } catch (err) {
        console.warn("Logo not found");
      }

      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.setTextColor(20, 30, 60);
      doc.text("PAPER SCHEDULE", pageWidth / 2, startY + 5, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(100, 110, 140);
      doc.text(typeName.toUpperCase(), pageWidth / 2, startY + 12, { align: 'center' });

      doc.setDrawColor(200, 205, 220);
      doc.setLineWidth(0.5);
      doc.line(pageWidth/2 - 40, startY + 18, pageWidth/2 + 40, startY + 18);

      const typeExams = exams.filter(e => e.paperTypeId === selectedPaperTypeId);
      const sortedExams = [...typeExams].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

      const getDayOfWeek = (dateStr: string) => {
        const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const d = new Date(dateStr + 'T12:00:00');
        return daysArr[d.getDay()];
      };

      const tableData = sortedExams.map(exam => {
        const dateDay = \`\${exam.date}\\n\${getDayOfWeek(exam.date)}\`;
        const timeText = \`\${formatTimeAmPm(exam.time)} \${exam.endTime ? '- ' + formatTimeAmPm(exam.endTime) : ''}\`;
        const className = exam.classId ? (classesList.find(c => c.id === exam.classId)?.name || 'Unknown') : 'Global';
        const invigs = exam.invigilators && exam.invigilators.length > 0 ? exam.invigilators.map(i => i.name).join(', ') : 'None';
        return [dateDay, timeText, exam.subject.toUpperCase(), className, invigs];
      });

      if (sortedExams.length > 0) {
          autoTable(doc, {
            startY: startY + 25,
            head: [['DATE & DAY', 'TIME', 'SUBJECT', 'CLASS', 'INVIGILATORS']],
            body: tableData,
            theme: 'grid',
            headStyles: { 
               fillColor: [20, 30, 60],
               textColor: [255, 255, 255], 
               halign: 'center', 
               valign: 'middle', 
               fontStyle: 'bold', 
               fontSize: 10,
               lineColor: [20, 30, 60],
               lineWidth: 0.6
            },
            bodyStyles: { 
               halign: 'center', 
               valign: 'middle', 
               textColor: [20, 30, 60], 
               fontSize: 9, 
               fontStyle: 'bold',
               lineColor: [40, 50, 80],
               lineWidth: 0.6,
               cellPadding: 4, 
            },
            alternateRowStyles: { fillColor: [248, 249, 251] },
            styles: { font: 'times', overflow: 'linebreak', halign: 'center', valign: 'middle', cellWidth: 'wrap' },
            margin: { left: 14, right: 14 }
          });
      } else {
         doc.setFont("times", "italic");
         doc.setFontSize(14);
         doc.setTextColor(150, 150, 150);
         doc.text("No papers scheduled for this type.", pageWidth / 2, startY + 30, { align: 'center' });
      }

      const lastTableY = sortedExams.length > 0 ? (doc as any).lastAutoTable.finalY : startY + 40;

      doc.setFillColor(250, 251, 253);
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, lastTableY + 10, pageWidth - 28, 24, 2, 2, 'FD');
      
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text("Important Instructions:", 18, lastTableY + 16);
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled paper.", 18, lastTableY + 22);
      doc.text("• The administration reserves the right to modify the schedule; please refer to official notice boards for updates.", 18, lastTableY + 28);

      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(20, 30, 60);
      doc.text(\`Issue Date: \${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}\`, 14, pageHeight - 20);
      
      doc.setDrawColor(20, 30, 60);
      doc.setLineWidth(0.6);
      doc.line(pageWidth - 70, pageHeight - 25, pageWidth - 14, pageHeight - 25);
      doc.text("Principal / Administrator", pageWidth - 42, pageHeight - 20, { align: 'center' });

      doc.save(\`\${typeName}_Schedule.pdf\`);
    } catch (e) {
      console.error(e);
      showToast("Error", "Failed to generate PDF", "error");
      triggerHapticError();
    }
  };
`;

content = content.replace('const exportToPDF = async () => {', newPdfLogic + '\n  const exportToPDF = async () => {');

fs.writeFileSync('src/App.tsx', content);
