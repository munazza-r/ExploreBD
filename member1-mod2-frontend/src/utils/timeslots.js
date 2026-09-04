// Generates 30-minute interval time options for the booking dropdown.
// Example: ["09:00", "09:30", "10:00", ..., "20:30"]
export function generateTimeSlots(startHour = 9, endHour = 20) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour !== endHour) {
      slots.push(`${String(hour).padStart(2, "0")}:30`);
    }
  }
  return slots;
}

// "15:00" -> "3:00 PM", "15:30" -> "3:30 PM"
export function formatTimeLabel(time24) {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}