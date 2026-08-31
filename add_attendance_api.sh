sed -i '/app.get("\/api\/logs"/i \
app.get("/api/teacher-attendance", authMiddleware, async (req, res) => {\
  try {\
    const { date, classId, month } = req.query;\
    const snapshot = await db.collection("teacher_attendance").get();\
    let records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));\
    if (date) records = records.filter(r => r.date === date);\
    if (classId) records = records.filter(r => r.classId === classId);\
    if (month) {\
       records = records.filter(r => r.date && r.date.startsWith(month));\
    }\
    res.json(records);\
  } catch (error) {\
    res.status(500).json({ error: "Failed to fetch attendance" });\
  }\
});\
\
app.post("/api/teacher-attendance", authMiddleware, async (req, res) => {\
  try {\
    const { date, classId, teachers } = req.body;\
    const id = `${date}_${classId}`;\
    await db.collection("teacher_attendance").doc(id).set({\
      date, classId, teachers, updatedAt: new Date().toISOString()\
    });\
    res.json({ success: true });\
  } catch (error) {\
    res.status(500).json({ error: "Failed to save attendance" });\
  }\
});\
' server.ts
