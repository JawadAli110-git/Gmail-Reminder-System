const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldCron = `cron.schedule("* * * * *", async () => {
  const now = new Date();
  
  // Use Asia/Karachi timezone for the user (UTC+5)
  const options = { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hour12: false } as const;
  const timeString = now.toLocaleTimeString("en-US", options);
  
  // timeString might be "14:30" or "24:30" (which is 00:30), let's parse safely
  const [hourStr, minuteStr] = timeString.split(":");
  let currentHours = hourStr;
  if (currentHours === "24") currentHours = "00";
  const currentTime = \`\${currentHours}:\${minuteStr}\`;
  
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Karachi" });

  const settings = await getSettings();
  const offset = settings.reminderOffset || 15;
  const timetable = await getTimetable();
  for (const entry of timetable) {
    const entryStart = parseTime(entry.time);
    const currentMins = parseTime(currentTime);
    if (entryStart - currentMins === offset && (entry.days.includes(currentDay) || entry.days.includes("Daily"))) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error("Cron Error: EMAIL_USER or EMAIL_APP_PASSWORD not set in .env");
        continue;
      }
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: entry.teacherEmail,
          subject: \`Reminder: Upcoming Class - \${entry.subject}\`,
          text: \`Dear \${entry.teacherName},\\n\\nThis is an automated reminder that your class for \${entry.subject} is starting at \${formatTimeAmPm(entry.time)}.\\n\\nBest regards,\\nAdmin System\`,
        };
        await transporter.sendMail(mailOptions);
        console.log(\`Reminder sent successfully to \${entry.teacherEmail}\`);
        emailLogs.unshift({
          id: Date.now().toString() + Math.random().toString(),
          timestamp: new Date().toISOString(),
          teacherEmail: entry.teacherEmail,
          subject: entry.subject,
          status: 'success'
        });
        
        // TA Reminder
        if (entry.taEmail && entry.taName) {
            try {
              const taMailOptions = {
                from: process.env.EMAIL_USER,
                to: entry.taEmail,
                subject: \`Reminder: Upcoming TA Duty - \${entry.subject}\`,
                text: \`Dear \${entry.taName},\\n\\nThis is an automated reminder that your TA duty for \${entry.subject} with \${entry.teacherName} is starting at \${formatTimeAmPm(entry.time)}.\\n\\nBest regards,\\nAdmin System\`,
              };
              await transporter.sendMail(taMailOptions);
              console.log(\`Reminder sent successfully to TA \${entry.taEmail}\`);
              emailLogs.unshift({
                id: Date.now().toString() + Math.random().toString(),
                timestamp: new Date().toISOString(),
                teacherEmail: entry.taEmail + " (TA)",
                subject: entry.subject,
                status: 'success'
              });
            } catch (taError) {
              console.error(\`Failed to send TA reminder to \${entry.taEmail}:\`, taError);
              emailLogs.unshift({
                id: Date.now().toString() + Math.random().toString(),
                timestamp: new Date().toISOString(),
                teacherEmail: entry.taEmail + " (TA)",
                subject: entry.subject,
                status: 'error',
                details: taError.message
              });
            }
        }

      } catch (error: any) {
        console.error(\`Failed to send reminder to \${entry.teacherEmail}:\`, error);
        emailLogs.unshift({
          id: Date.now().toString() + Math.random().toString(),
          timestamp: new Date().toISOString(),
          teacherEmail: entry.teacherEmail,
          subject: entry.subject,
          status: 'error',
          details: error.message
        });
      }
    }
  }

  // Check exams
  const currentDateISO = now.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }); // YYYY-MM-DD
  const exams = await getExams();
  for (const exam of exams) {
    if (exam.date === currentDateISO && exam.time === currentTime) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) continue;
      
      for (const invigilator of exam.invigilators || []) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: invigilator.email,
            subject: \`Reminder: Invigilation Duty - \${exam.subject}\`,
            text: \`Dear \${invigilator.name},\\n\\nThis is an automated reminder that you have an invigilation duty for \${exam.subject} starting at \${formatTimeAmPm(exam.time)}.\\n\\nBest regards,\\nAdmin System\`,
          };
          await transporter.sendMail(mailOptions);
          emailLogs.unshift({
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toISOString(),
            teacherEmail: invigilator.email,
            subject: exam.subject + " (Exam)",
            status: 'success'
          });
        } catch (error: any) {
          console.error(\`Failed to send exam reminder to \${invigilator.email}:\`, error);
          emailLogs.unshift({
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toISOString(),
            teacherEmail: invigilator.email,
            subject: exam.subject + " (Exam)",
            status: 'error',
            details: error.message
          });
        }
      }
      if (emailLogs.length > 50) emailLogs = emailLogs.slice(0, 50);
    }
  }
});`;

const newCron = `cron.schedule("* * * * *", async () => {
  const now = new Date();
  
  // Use Asia/Karachi timezone for the user (UTC+5)
  const options = { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hour12: false } as const;
  const timeString = now.toLocaleTimeString("en-US", options);
  
  // timeString might be "14:30" or "24:30" (which is 00:30), let's parse safely
  const [hourStr, minuteStr] = timeString.split(":");
  let currentHours = hourStr;
  if (currentHours === "24") currentHours = "00";
  const currentTime = \`\${currentHours}:\${minuteStr}\`;
  
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Karachi" });

  const settings = await getSettings();
  const offset = settings.reminderOffset || 180; // default 3 hours
  const timetable = await getTimetable();
  for (const entry of timetable) {
    const entryStart = parseTime(entry.time);
    const currentMins = parseTime(currentTime);
    let diff = entryStart - currentMins;
    if (diff < 0) diff += 24 * 60;
    
    if ((diff === 60 || diff === offset) && (entry.days.includes(currentDay) || entry.days.includes("Daily"))) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error("Cron Error: EMAIL_USER or EMAIL_APP_PASSWORD not set in .env");
        continue;
      }
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: entry.teacherEmail,
          subject: \`Reminder: Upcoming Class - \${entry.subject}\`,
          text: \`Dear \${entry.teacherName},\\n\\nThis is an automated reminder that your class for \${entry.subject} is starting at \${formatTimeAmPm(entry.time)}.\\n\\nBest regards,\\nAdmin System\`,
        };
        await transporter.sendMail(mailOptions);
        console.log(\`Reminder sent successfully to \${entry.teacherEmail}\`);
        emailLogs.unshift({
          id: Date.now().toString() + Math.random().toString(),
          timestamp: new Date().toISOString(),
          teacherEmail: entry.teacherEmail,
          subject: entry.subject,
          status: 'success'
        });
        
        // TA Reminder
        if (entry.taEmail && entry.taName) {
            try {
              const taMailOptions = {
                from: process.env.EMAIL_USER,
                to: entry.taEmail,
                subject: \`Reminder: Upcoming TA Duty - \${entry.subject}\`,
                text: \`Dear \${entry.taName},\\n\\nThis is an automated reminder that your TA duty for \${entry.subject} with \${entry.teacherName} is starting at \${formatTimeAmPm(entry.time)}.\\n\\nBest regards,\\nAdmin System\`,
              };
              await transporter.sendMail(taMailOptions);
              console.log(\`Reminder sent successfully to TA \${entry.taEmail}\`);
              emailLogs.unshift({
                id: Date.now().toString() + Math.random().toString(),
                timestamp: new Date().toISOString(),
                teacherEmail: entry.taEmail + " (TA)",
                subject: entry.subject,
                status: 'success'
              });
            } catch (taError) {
              console.error(\`Failed to send TA reminder to \${entry.taEmail}:\`, taError);
              emailLogs.unshift({
                id: Date.now().toString() + Math.random().toString(),
                timestamp: new Date().toISOString(),
                teacherEmail: entry.taEmail + " (TA)",
                subject: entry.subject,
                status: 'error',
                details: (taError as any).message
              });
            }
        }

      } catch (error: any) {
        console.error(\`Failed to send reminder to \${entry.teacherEmail}:\`, error);
        emailLogs.unshift({
          id: Date.now().toString() + Math.random().toString(),
          timestamp: new Date().toISOString(),
          teacherEmail: entry.teacherEmail,
          subject: entry.subject,
          status: 'error',
          details: error.message
        });
      }
    }
  }

  // Check exams
  const currentDateISO = now.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }); // YYYY-MM-DD
  const exams = await getExams();
  for (const exam of exams) {
    const examStart = parseTime(exam.time);
    const currentMins = parseTime(currentTime);
    let diff = examStart - currentMins;
    if (diff < 0) diff += 24 * 60;
    
    if (exam.date === currentDateISO && (diff === 60 || diff === offset)) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) continue;
      
      for (const invigilator of exam.invigilators || []) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: invigilator.email,
            subject: \`Reminder: Invigilation Duty - \${exam.subject}\`,
            text: \`Dear \${invigilator.name},\\n\\nThis is an automated reminder that you have an invigilation duty for \${exam.subject} starting at \${formatTimeAmPm(exam.time)}.\\n\\nBest regards,\\nAdmin System\`,
          };
          await transporter.sendMail(mailOptions);
          emailLogs.unshift({
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toISOString(),
            teacherEmail: invigilator.email,
            subject: exam.subject + " (Exam)",
            status: 'success'
          });
        } catch (error: any) {
          console.error(\`Failed to send exam reminder to \${invigilator.email}:\`, error);
          emailLogs.unshift({
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toISOString(),
            teacherEmail: invigilator.email,
            subject: exam.subject + " (Exam)",
            status: 'error',
            details: error.message
          });
        }
      }
    }
  }
  if (emailLogs.length > 50) emailLogs = emailLogs.slice(0, 50);
});`;

if (content.includes('const currentDay = now.toLocaleDateString')) {
    content = content.replace(oldCron, newCron);
    fs.writeFileSync('server.ts', content);
    console.log("Updated server.ts successfully");
} else {
    console.log("Failed to match cron text");
}
