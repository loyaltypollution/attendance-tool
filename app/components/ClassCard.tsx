'use client';

import React, { useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { ClassInfo, Student, AttendanceStatus, DayOfWeek } from '../../lib/types'; // Adjust path
import { mockClasses, getRescheduleOptions } from '../../lib/mockData'; // Adjust path
import Calendar from 'react-calendar'; // Needed for Reschedule Popup
import StudentListItem from './StudentListItem'; // Import the new component

// Define the shape of the class instance data passed as props
interface DisplayStudent extends Student {
    isMakeup: boolean;
}
interface EffectiveClassInstance extends ClassInfo {
    displayStudents: DisplayStudent[];
}

// Define the shape of the rescheduling state passed as props
interface ReschedulingInfo {
    studentId: string;
    studentName: string;
    originalClassId: string;
}

interface ClassCardProps {
    classInstance: EffectiveClassInstance;
    formattedSelectedDate: string;
    reschedulingInfo: ReschedulingInfo | null;
    rescheduleTargetClassId: string;
    rescheduleTargetDate: Date | null;
    selectedRescheduleClassInfo: ClassInfo | null; // Pass the derived info
    getStudentAttendanceDetails: (studentId: string, classId: string, date: string) => { status: AttendanceStatus; rescheduledToClassId?: string; rescheduledToDate?: string };
    handleAttendanceChange: (studentId: string, classId: string, newStatus: AttendanceStatus, rescheduleTarget?: { classId: string; date: string }) => void;
    handleRescheduleClick: (studentId: string, studentName: string, classId: string) => void;
    confirmReschedule: () => void;
    setReschedulingInfo: (info: ReschedulingInfo | null) => void;
    setRescheduleTargetClassId: (id: string) => void;
    setRescheduleTargetDate: (date: Date | null) => void;
    disableRescheduleDates: ({ date, view }: { date: Date, view: string }) => boolean;
    handleRescheduleDateChange: (value: unknown) => void;
}

// Helper function (can be moved to a utils file later)
const formatTime = (hour: number, minute: number): string => {
    const date = new Date();
    date.setHours(hour, minute);
    return format(date, 'h:mm a');
};

export default function ClassCard({
    classInstance,
    formattedSelectedDate,
    reschedulingInfo,
    rescheduleTargetClassId,
    rescheduleTargetDate,
    selectedRescheduleClassInfo,
    getStudentAttendanceDetails,
    handleAttendanceChange,
    handleRescheduleClick,
    confirmReschedule,
    setReschedulingInfo,
    setRescheduleTargetClassId,
    setRescheduleTargetDate,
    disableRescheduleDates,
    handleRescheduleDateChange
}: ClassCardProps) {

    const reschedulePopupRef = useRef<HTMLDivElement>(null); // Keep ref local if popup is local
    // Note: useEffect for click outside might need to be in the parent if state control is there,
    // or manage visibility state locally within ClassCard if preferred.
    // For now, assuming parent handles closing via setReschedulingInfo(null).

    // Calculate reschedule options locally based on the current classInstance
    const rescheduleOptions = useMemo(() => getRescheduleOptions(classInstance.id), [classInstance.id]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">{classInstance.name}</h3>
            <p className="text-gray-600 mb-4">Time: {formatTime(classInstance.time.hour, classInstance.time.minute)}</p>

            {/* Student List - Now uses StudentListItem */}
            <div className="space-y-3">
                <h4 className="text-lg font-medium mb-2">Students</h4>
                {classInstance.displayStudents.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No students for this class instance.</p>
                ) : (
                    classInstance.displayStudents.map((student) => (
                        <StudentListItem
                            key={student.id}
                            student={student}
                            classInstanceId={classInstance.id}
                            classInstanceName={classInstance.name}
                            formattedSelectedDate={formattedSelectedDate}
                            reschedulingInfo={reschedulingInfo}
                            rescheduleTargetClassId={rescheduleTargetClassId}
                            rescheduleTargetDate={rescheduleTargetDate}
                            selectedRescheduleClassInfo={selectedRescheduleClassInfo}
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
                    ))
                )}
            </div>
        </div>
    );
} 