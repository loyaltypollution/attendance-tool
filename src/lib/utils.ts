import { format } from 'date-fns';

// Helper function to format time
export const formatTime = (hour: number, minute: number): string => {
  const date = new Date();
  date.setHours(hour, minute);
  return format(date, 'h:mm a'); // e.g., 9:00 AM
};

// Helper function to get day name from day of week
export const getDayName = (dayOfWeek: number): string => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
}; 