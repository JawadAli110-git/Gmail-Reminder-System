const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `await transporter.sendMail(mailOptions);
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
                details: taError.message || "Failed"
              });
            }
        }`;

content = content.replace(
  /await transporter\.sendMail\(mailOptions\);\s*console\.log\(`Reminder sent successfully to \$\{entry\.teacherEmail\}`\);\s*emailLogs\.unshift\(\{\s*id: Date\.now\(\)\.toString\(\) \+ Math\.random\(\)\.toString\(\),\s*timestamp: new Date\(\)\.toISOString\(\),\s*teacherEmail: entry\.teacherEmail,\s*subject: entry\.subject,\s*status: 'success'\s*\}\);/g,
  replacement
);

fs.writeFileSync('server.ts', content);
