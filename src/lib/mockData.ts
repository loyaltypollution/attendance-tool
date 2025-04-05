import { ClassInfo, Student, AttendanceRecord } from './types';

export const mockStudents: Student[] = [
  { id: 's1', name: 'Alice' },
  { id: 's2', name: 'Bob' },
  { id: 's3', name: 'Charlie' },
  { id: 's4', name: 'David' },
  { id: 's5', name: 'Eve' },
  { id: 's6', name: 'Frank' },
];

export const mockClasses: ClassInfo[] = [
  {
    id: 'c1',
    name: 'Math 101',
    time: { dayOfWeek: 1, hour: 9, minute: 0 }, // Monday 9:00 AM
    students: [mockStudents[0], mockStudents[1], mockStudents[2]],
  },
  {
    id: 'c2',
    name: 'Physics Lab',
    time: { dayOfWeek: 1, hour: 13, minute: 30 }, // Monday 1:30 PM
    students: [mockStudents[3], mockStudents[4]],
  },
  {
    id: 'c3',
    name: 'History Discussion',
    time: { dayOfWeek: 3, hour: 11, minute: 0 }, // Wednesday 11:00 AM
    students: [mockStudents[0], mockStudents[3], mockStudents[5]],
  },
  {
    id: 'c4',
    name: 'Chemistry Lecture',
    time: { dayOfWeek: 5, hour: 14, minute: 0 }, // Friday 2:00 PM
    students: [mockStudents[1], mockStudents[4], mockStudents[5]],
  },
  {
    id: 'c5',
    name: 'Advanced Math',
    time: { dayOfWeek: 5, hour: 16, minute: 0 }, // Friday 4:00 PM
    students: [mockStudents[2], mockStudents[0]],
  },
];

// Initial empty attendance data or potentially pre-filled data
export const initialAttendance: { [date: string]: AttendanceRecord[] } = {
  // Example structure - this would typically be fetched or managed dynamically
  // '2024-04-08': [
  //   { studentId: 's1', classId: 'c1', date: '2024-04-08', status: 'Present' },
  //   { studentId: 's2', classId: 'c1', date: '2024-04-08', status: 'Absent' },
  // ],
};

// Function to get all possible reschedule targets (other classes)
export const getRescheduleOptions = (excludeClassId: string): ClassInfo[] => {
  return mockClasses.filter(cls => cls.id !== excludeClassId);
}; 