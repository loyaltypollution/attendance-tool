'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, getDay, parseISO, startOfDay, isBefore, isEqual } from 'date-fns';
import { mockClasses, initialAttendance, getRescheduleOptions, mockStudents } from '../lib/mockData';
import { ClassInfo, AttendanceRecord, Student, AttendanceStatus, DayOfWeek } from '../lib/types';
import { ChevronDown, Check, X, Calendar as CalendarIcon } from 'lucide-react';
import AttendanceCalendar from './components/AttendanceCalendar';
import ClassCard from './components/ClassCard';

// Helper function to format time
const formatTime = (hour: number, minute: number): string => {
  const date = new Date();
  date.setHours(hour, minute);
  return format(date, 'h:mm a'); // e.g., 9:00 AM
};

interface ReschedulingInfo {
  studentId: string;
  studentName: string;
  originalClassId: string;
}

// Interface for students appearing in a class instance, noting if it's a makeup
interface DisplayStudent extends Student {
  isMakeup: boolean;
}

interface EffectiveClassInstance extends ClassInfo {
    displayStudents: DisplayStudent[];
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  // In a real app, this would likely come from context, Zustand, Redux, or fetched data
  const [attendanceData, setAttendanceData] = useState<{ [date: string]: AttendanceRecord[] }>(
    initialAttendance
  );
  const [reschedulingInfo, setReschedulingInfo] = useState<ReschedulingInfo | null>(null);
  const [rescheduleTargetClassId, setRescheduleTargetClassId] = useState<string>('');
  const [rescheduleTargetDate, setRescheduleTargetDate] = useState<Date | null>(null);

  const reschedulePopupRef = useRef<HTMLDivElement>(null);

  const formattedSelectedDate = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const selectedDayOfWeek = useMemo(() => getDay(selectedDate) as DayOfWeek, [selectedDate]);

  // Filter classes normally scheduled for the selected day of the week
  const regularlyScheduledClasses = useMemo(() => {
    return mockClasses.filter(cls => cls.time.dayOfWeek === selectedDayOfWeek);
  }, [selectedDayOfWeek]);

  // --- New Logic: Calculate effective classes and students for the selected date --- 
  const effectiveClassesForSelectedDate: EffectiveClassInstance[] = useMemo(() => {
    const dateKey = formattedSelectedDate;
    const makeupStudentsByClass: { [classId: string]: DisplayStudent[] } = {};

    // Iterate through all attendance data to find students rescheduled *to* this date
    Object.values(attendanceData).flat().forEach(record => {
      if (
        record.status === 'Rescheduled' &&
        record.rescheduledToDate === dateKey &&
        record.rescheduledToClassId
      ) {
        const student = mockStudents.find(s => s.id === record.studentId);
        if (student) {
          const targetClassId = record.rescheduledToClassId;
          if (!makeupStudentsByClass[targetClassId]) {
            makeupStudentsByClass[targetClassId] = [];
          }
          // Add as makeup student if not already added
          if (!makeupStudentsByClass[targetClassId].some(s => s.id === student.id)) {
             makeupStudentsByClass[targetClassId].push({ ...student, isMakeup: true });
          }
        }
      }
    });

    // Combine regular classes and classes that only have makeup students for this date
    const combinedClasses = [...regularlyScheduledClasses];
    const regularClassIds = new Set(regularlyScheduledClasses.map(c => c.id));

    // Add classes that might *only* have makeup students today
    Object.keys(makeupStudentsByClass).forEach(classId => {
      if (!regularClassIds.has(classId)) {
        const makeupOnlyClass = mockClasses.find(c => c.id === classId);
        if (makeupOnlyClass) {
          combinedClasses.push(makeupOnlyClass);
        }
      }
    });

    // Map to the final structure, combining regular and makeup students per class
    return combinedClasses.map(classInfo => {
      const regularStudents: DisplayStudent[] = classInfo.students.map(s => ({ ...s, isMakeup: false }));
      const makeupStudents: DisplayStudent[] = makeupStudentsByClass[classInfo.id] || [];

      // Combine and deduplicate students, ensuring makeup students are last
      const allStudentsMap = new Map<string, DisplayStudent>();
      const sortedStudents: DisplayStudent[] = [];

      // Add regular students first
      regularStudents.forEach(student => {
        if (!allStudentsMap.has(student.id)) {
          allStudentsMap.set(student.id, student);
          sortedStudents.push(student);
        }
      });

      // Add makeup students, ensuring no duplicates and they appear after regulars
      makeupStudents.forEach(student => {
        if (!allStudentsMap.has(student.id)) {
           allStudentsMap.set(student.id, student);
           sortedStudents.push(student);
        }
         // If student exists but is regular, update to makeup status (should ideally not happen if logic above is correct)
         // And ensure they are at the end - this part is tricky without re-sorting or complex logic.
         // Simpler: Assume makeupStudents list only contains true makeups.
         // The Map ensures deduplication. The order is preserved by adding regulars then makeups.
      });

      return {
        ...classInfo,
        displayStudents: sortedStudents,
      };
    });

  }, [formattedSelectedDate, selectedDayOfWeek, attendanceData, regularlyScheduledClasses]);
  // --- End New Logic --- 

  // Function to get attendance status for a student in a class on a specific date
  const getStudentAttendanceStatus = (
    studentId: string,
    classId: string,
    date: string
  ): AttendanceStatus => {
    const recordsForDate = attendanceData[date] || [];
    const record = recordsForDate.find(r => r.studentId === studentId && r.classId === classId);
    return record ? record.status : 'Pending';
  };

  // Function to update attendance (now includes reschedule details retrieval)
  const getStudentAttendanceDetails = (
    studentId: string,
    classId: string,
    date: string
  ): { status: AttendanceStatus; rescheduledToClassId?: string; rescheduledToDate?: string } => {
    const recordsForDate = attendanceData[date] || [];
    const record = recordsForDate.find(r => r.studentId === studentId && r.classId === classId);
    return {
      status: record ? record.status : 'Pending',
      rescheduledToClassId: record?.rescheduledToClassId,
      rescheduledToDate: record?.rescheduledToDate,
    };
  };

  // Updated handleAttendanceChange
  const handleAttendanceChange = (
    studentId: string,
    classId: string,
    newStatus: AttendanceStatus,
    rescheduleTarget?: { classId: string; date: string } // Optional reschedule target
  ) => {
    const dateKey = formattedSelectedDate;

    setAttendanceData(prevData => {
      const updatedRecordsForDate = [...(prevData[dateKey] || [])];
      const existingRecordIndex = updatedRecordsForDate.findIndex(
        r => r.studentId === studentId && r.classId === classId && r.date === dateKey
      );

      const newRecord: AttendanceRecord = {
        studentId,
        classId,
        date: dateKey,
        status: newStatus,
        // Clear reschedule details if status is NOT 'Rescheduled'
        rescheduledToClassId: newStatus === 'Rescheduled' ? rescheduleTarget?.classId : undefined,
        rescheduledToDate: newStatus === 'Rescheduled' ? rescheduleTarget?.date : undefined,
      };

      if (existingRecordIndex !== -1) {
        // Update existing record
        updatedRecordsForDate[existingRecordIndex] = newRecord;
      } else {
        // Add new record
        updatedRecordsForDate.push(newRecord);
      }

      return {
        ...prevData,
        [dateKey]: updatedRecordsForDate,
      };
    });

    // Close reschedule popup if open for this student/class
    if (reschedulingInfo?.studentId === studentId && reschedulingInfo?.originalClassId === classId) {
      setReschedulingInfo(null);
    }

    console.log(`Updated attendance for ${studentId} in ${classId} on ${dateKey} to ${newStatus}`);
    if (newStatus === 'Rescheduled' && rescheduleTarget) {
      console.log(`   Rescheduled to Class ${rescheduleTarget.classId} on ${rescheduleTarget.date}`);
    }
  };

  const handleRescheduleClick = (studentId: string, studentName: string, classId: string) => {
    if (reschedulingInfo?.studentId === studentId && reschedulingInfo?.originalClassId === classId) {
      setReschedulingInfo(null);
    } else {
      setReschedulingInfo({ studentId, studentName, originalClassId: classId });
      setRescheduleTargetClassId(''); // Reset target class selection
      setRescheduleTargetDate(null); // Reset target date
    }
  };

  // Find the selected target class details for date disabling
  const selectedRescheduleClassInfo = useMemo(() => {
      if (!rescheduleTargetClassId) return null;
      return mockClasses.find(c => c.id === rescheduleTargetClassId);
  }, [rescheduleTargetClassId]);

  // Function to disable dates in the reschedule calendar
  const disableRescheduleDates = ({ date, view }: { date: Date, view: string }): boolean => {
    // Disable past dates (allow today)
    if (isBefore(date, startOfDay(new Date()))) {
        return true;
    }
    // Only check month view
    if (view === 'month') {
      // If no target class selected, disable all future dates
      if (!selectedRescheduleClassInfo) {
          return true;
      }
      // Disable dates that don't match the target class's dayOfWeek
      return getDay(date) !== selectedRescheduleClassInfo.time.dayOfWeek;
    }
    return false; // Don't disable other views like year/decade
  };

  const handleRescheduleDateChange = (value: unknown) => {
      if (value instanceof Date) {
         // Check if the selected date is not disabled
         if (!disableRescheduleDates({ date: value, view: 'month' })) {
             setRescheduleTargetDate(startOfDay(value));
         }
      } else if (Array.isArray(value) && value[0] instanceof Date) {
         if (!disableRescheduleDates({ date: value[0], view: 'month' })) {
             setRescheduleTargetDate(startOfDay(value[0]));
         }
      } else {
         console.error('Unexpected value type from Reschedule Calendar:', value);
         setRescheduleTargetDate(null);
      }
  };

  const confirmReschedule = () => {
    if (!reschedulingInfo || !rescheduleTargetClassId || !rescheduleTargetDate) {
        console.error("Cannot confirm reschedule: Missing info", { reschedulingInfo, rescheduleTargetClassId, rescheduleTargetDate });
        return;
    }

    handleAttendanceChange(
      reschedulingInfo.studentId,
      reschedulingInfo.originalClassId,
      'Rescheduled',
      {
        classId: rescheduleTargetClassId,
        date: format(rescheduleTargetDate, 'yyyy-MM-dd')
      }
    );
  };

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reschedulePopupRef.current && !reschedulePopupRef.current.contains(event.target as Node)) {
        setReschedulingInfo(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // *** Note: handleDateChange remains here as it modifies state owned by AttendancePage ***
  const handleDateChange = (value: unknown) => {
    if (value instanceof Date) {
      setSelectedDate(startOfDay(value));
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(startOfDay(value[0]));
    } else {
      console.error('Unexpected value type from Calendar:', value);
      setSelectedDate(startOfDay(new Date()));
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Attendance Tracker</h1>

      {/* Use the new AttendanceCalendar component */}
      <AttendanceCalendar 
         selectedDate={selectedDate}
         onDateChange={handleDateChange} 
      />

      {/* Classes Section - Use ClassCard component */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Classes for {format(selectedDate, 'EEEE, MMMM do')}</h2>
        {effectiveClassesForSelectedDate.length === 0 ? (
          <p className="text-gray-500 italic">No classes scheduled for this day.</p>
        ) : (
          <div className="space-y-6">
            {effectiveClassesForSelectedDate.map((classInstance) => (
              <ClassCard
                key={classInstance.id}
                classInstance={classInstance}
                formattedSelectedDate={formattedSelectedDate}
                reschedulingInfo={reschedulingInfo}
                rescheduleTargetClassId={rescheduleTargetClassId}
                rescheduleTargetDate={rescheduleTargetDate}
                selectedRescheduleClassInfo={selectedRescheduleClassInfo ?? null}
                getStudentAttendanceDetails={getStudentAttendanceDetails}
                handleAttendanceChange={handleAttendanceChange}
                handleRescheduleClick={handleRescheduleClick}
                confirmReschedule={confirmReschedule}
                setReschedulingInfo={setReschedulingInfo}
                setRescheduleTargetClassId={setRescheduleTargetClassId}
                setRescheduleTargetDate={setRescheduleTargetDate}
                disableRescheduleDates={disableRescheduleDates}
                handleRescheduleDateChange={handleRescheduleDateChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Style block (keep for now, might move styles later) */}
      <style jsx global>{`
        /* Styles for the main calendar (react-calendar-custom) */
        .react-calendar-custom {
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .react-calendar-custom .react-calendar__tile--active {
          background-color: #007bff !important;
          color: white !important;
        }
        .react-calendar-custom .react-calendar__tile--now {
           background-color: #eee !important;
           font-weight: bold;
        }

        /* Styles for the reschedule calendar (react-calendar-reschedule) */
        .react-calendar-reschedule {
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 0.8rem; /* Smaller font for popup */
        }
        .react-calendar-reschedule .react-calendar__tile {
            padding: 0.5em 0.3em; /* Adjust padding */
        }
        .react-calendar-reschedule .react-calendar__tile--active {
          background-color: #007bff !important;
          color: white !important;
        }
        .react-calendar-reschedule .react-calendar__tile--now {
           background-color: #eee !important;
           font-weight: bold;
        }
         /* Style disabled tiles */
         .react-calendar-reschedule .react-calendar__tile:disabled {
            background-color: #f8f8f8;
            color: #ccc;
            cursor: not-allowed;
         }
         .react-calendar-reschedule .react-calendar__tile:enabled:hover,
         .react-calendar-reschedule .react-calendar__tile:enabled:focus {
            background-color: #e6e6e6;
         }
      `}</style>
    </div>
  );
}
