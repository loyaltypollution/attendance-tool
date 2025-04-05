export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday

export interface Student {
  id: string;
  name: string;
}

export interface ClassTime {
  dayOfWeek: DayOfWeek;
  hour: number; // 0-23
  minute: number; // 0-59
}

export interface ClassInfo {
  id: string;
  name: string;
  time: ClassTime;
  students: Student[];
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Rescheduled' | 'Pending'; // Added 'Pending' for initial state

export interface AttendanceRecord {
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
  rescheduledToClassId?: string;
  rescheduledToDate?: string; // YYYY-MM-DD format for the makeup class
}

// Represents a specific class instance on a given date, including student attendance
export interface ClassInstance {
  classInfo: ClassInfo;
  date: string; // YYYY-MM-DD format
  studentAttendance: {
    [studentId: string]: AttendanceStatus;
  };
  rescheduleDetails?: {
    [studentId: string]: {
      rescheduledToClassId: string;
      rescheduledToDate: string;
    };
  };
} 