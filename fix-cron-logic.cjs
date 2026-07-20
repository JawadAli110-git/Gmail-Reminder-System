const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldCron = content.substring(content.indexOf('cron.schedule("* * * * *"'), content.lastIndexOf('});', content.indexOf('async function getSettings()')) + 3);

const newCron = `cron.schedule("* * * * *", async () => {
  const now = new Date();
  
  // Create a formatter for Karachi time
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  
  // We don't parse a string to a new Date object, we just calculate targets
  // in milliseconds and then format them to Karachi time.
  const getKarachiInfo = (dateObj: Date) => {
      const parts = formatter.formatToParts(dateObj);
      const get = (type: string) => parts.find(p => p.type === type)?.value;
      const y = get('year');
      const m = get('month');
      const d = get('day');
      const hr = parseInt(get('hour') || '0');
      const min = parseInt(get('minute') || '0');
      // Fix 24 to 0
      const hrAdjusted = hr === 24 ? 0 : hr;
      
      const dateISO = \`\${y}-\${m}-\${d}\`;
      const timeMins = hrAdjusted * 60 + min;
      
      const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      // To get weekday in Karachi:
      const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', weekday: 'long' }).format(dateObj);
      
      return { dateISO, timeMins, weekdayStr };
  };

  const settings = await getSettings();
  const offset = settings.reminderOffset || 180; // default 3 hours
  const targets = [60, offset]; // 1 hour and user-defined offset

  const timetable = await getTimetable();
  const exams = await getExams();

  for (const t of targets) {
    const targetDate = new Date(now.getTime() + t * 60000);
    const targetInfo = getKarachiInfo(targetDate);
    
    // Check Timetable
    for (const entry of timetable) {
      const entryStart = parseTime(entry.time);
      if (entryStart === targetInfo.timeMins && (entry.days.includes(targetInfo.weekdayStr) || entry.days.includes("Daily"))) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) continue;
        
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: entry.teacherEmail,
            subject: \`Reminder: Upcoming Class - \${entry.subject}\`,
            text: \`Dear \${entry.teacherName},\\n\\nThis is an automated reminder that your class for \${entry.subject} is starting at \${formatTimeAmPm(entry.time)}.\\n\\nBest regards,\\nAdmin System\`,
          };
          await transporter.sendMail(mailOptions);
          emailLogs.unshift({
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toISOString(),
            teacherEmail: entry.teacherEmail,
            subject: entry.subject,
            status: 'success'
          });
          
          if (entry.taEmail && entry.taName) {
            try {
              const taMailOptions = {
                from: process.env.EMAIL_USER,
                to: entry.taEmail,
                subject: \`Reminder: Upcoming TA Duty - \${entry.subject}\`,
                text: \`Dear \${entry.taName},\\n\\nThis is an automated reminder that your TA duty for \${entry.subject} with \${entry.teacherName} is starting at \${formatTimeAmPm(entry.time)}.\\n\\nBest regards,\\nAdmin System\`,
              };
              await transporter.sendMail(taMailOptions);
              emailLogs.unshift({
                id: Date.now().toString() + Math.random().toString(),
                timestamp: new Date().toISOString(),
                teacherEmail: entry.taEmail + " (TA)",
                subject: entry.subject,
                status: 'success'
              });
            } catch (taError: any) {
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

    // Check Exams
    for (const exam of exams) {
      const examStart = parseTime(exam.time);
      if (exam.date === targetInfo.dateISO && examStart === targetInfo.timeMins) {
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
  }

  if (emailLogs.length > 50) emailLogs = emailLogs.slice(0, 50);
});`;

content = content.replace(oldCron, newCron);
fs.writeFileSync('server.ts', content);
