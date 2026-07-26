import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /doc\.roundedRect\(24, lastTableY \+ 10, pageWidth - 48, 24, 2, 2, 'FD'\);\s*doc\.setFontSize\(11\);\s*doc\.setFont\("times", "bold"\);\s*doc\.setTextColor\(20, 30, 60\);\s*doc\.text\("Important Instructions:", 28, lastTableY \+ 16\);\s*doc\.setFontSize\(10\);\s*doc\.setFont\("times", "normal"\);\s*doc\.setTextColor\(60, 60, 60\);\s*doc\.text\("• All students must be present 15 minutes prior to the commencement of their scheduled paper\.", 28, lastTableY \+ 22\);\s*doc\.text\("• The administration reserves the right to modify the schedule; please refer to official notice boards for updates\.", 28, lastTableY \+ 28\);/g;

const replacement = `if (forTeachers) {
        doc.roundedRect(24, lastTableY + 10, pageWidth - 48, 38, 2, 2, 'FD');
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.setTextColor(20, 30, 60);
        doc.text("Instructions for Invigilators:", 28, lastTableY + 16);
        doc.setFontSize(9.5);
        doc.setFont("times", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text("• All invigilators must be present 30 minutes before test timing and be in formal dressing.", 28, lastTableY + 22);
        doc.text("• Make sure students sit in class 15 minutes before and check their stationery/calculator (if needed).", 28, lastTableY + 28);
        doc.text("• Inform E.B's head in case of any issue during assessment and arrange your replacement.", 28, lastTableY + 34);
      } else {
        doc.roundedRect(24, lastTableY + 10, pageWidth - 48, 24, 2, 2, 'FD');
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.setTextColor(20, 30, 60);
        doc.text("Important Instructions:", 28, lastTableY + 16);
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text("• All students must be present 15 minutes prior to the commencement of their scheduled paper.", 28, lastTableY + 22);
        doc.text("• The administration reserves the right to modify the schedule; please refer to official notice boards for updates.", 28, lastTableY + 28);
      }`;

let replaced = false;
content = content.replace(regex, () => {
    replaced = true;
    return replacement;
});

if (!replaced) {
    console.error("Could not find the instructions block to replace!");
}

fs.writeFileSync('src/App.tsx', content);
