# Smart Classroom Reminder and Scheduling System

The Smart Classroom Reminder and Scheduling System is an automated, Gmail-integrated platform developed to streamline communication between academic administration and teaching staff regarding class schedules and examination duties. The system eliminates the need for manual reminders by automatically notifying teachers of their upcoming classes within a configurable time window prior to the scheduled session. To ensure relevance and avoid unnecessary notifications, the system intelligently excludes free or unallocated periods from its reminder logic.

In addition to regular class notifications, the system extends its functionality to examination management. When an exam or paper is scheduled for a given date, the system automatically identifies the invigilators assigned to that exam and dispatches timely email notifications to inform them of their duties.

The platform further incorporates a timetable generation module, enabling administrators to create and manage timetables for specific classes efficiently.

A distinguishing feature of the system is its integration of Artificial Intelligence through a built-in chatbot. This conversational assistant enables users to retrieve schedule-related information in real time, such as identifying which class is in session at a given time or retrieving the complete weekly schedule of a specific teacher, thereby enhancing the system's overall usability and accessibility.

## Key Features

- Automated email reminders for scheduled classes
- Intelligent filtering of free periods to avoid redundant notifications
- Exam/paper scheduling with automated invigilator notification
- Timetable generation for specific classes
- AI-powered chatbot for interactive, real-time schedule queries
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
