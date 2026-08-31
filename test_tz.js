const selectedDate = "2026-08-24";
const dateObj = new Date(selectedDate);
console.log(dateObj.getDay(), dateObj);
const [year, month, day] = selectedDate.split("-").map(Number);
const dateObj2 = new Date(year, month - 1, day);
console.log(dateObj2.getDay(), dateObj2);
