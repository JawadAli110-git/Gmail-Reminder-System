const selectedDate = "2026-08-24";
const [year, month, day] = selectedDate.split("-").map(Number);
const dateObj = new Date(year, month - 1, day);
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayOfWeek = dayNames[dateObj.getDay()];
console.log(dayOfWeek);
