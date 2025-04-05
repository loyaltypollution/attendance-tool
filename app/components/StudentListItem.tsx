'use client';

import React, { useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { ClassInfo, Student, AttendanceStatus, DayOfWeek } from '../../lib/types'; // Adjust path
import { mockClasses, getRescheduleOptions } from '../../lib/mockData'; // Adjust path
import Calendar from 'react-calendar';

// Copied relevant interfaces (can be centralized later)
interface DisplayStudent extends Student {
    isMakeup: boolean;
}
interface ReschedulingInfo {
    studentId: string;
    studentName: string;
    originalClassId: string;
}

// Helper function (can be moved to a utils file later)
const formatTime = (hour: number, minute: number): string => {
    const date = new Date();
    date.setHours(hour, minute);
    return format(date, 'h:mm a');
};

interface StudentListItemProps {
    student: DisplayStudent;
    classInstanceId: string;
    classInstanceName: string; // Needed for reschedule popup text
    formattedSelectedDate: string;
    reschedulingInfo: ReschedulingInfo | null;
    rescheduleTargetClassId: string;
    rescheduleTargetDate: Date | null;
    selectedRescheduleClassInfo: ClassInfo | null;
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

export default function StudentListItem({
    student,
    classInstanceId,
    classInstanceName,
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
}: StudentListItemProps) {

    const reschedulePopupRef = useRef<HTMLDivElement>(null);
    const { status, rescheduledToClassId, rescheduledToDate } = getStudentAttendanceDetails(student.id, classInstanceId, formattedSelectedDate);
    const isCurrentlyRescheduling = reschedulingInfo?.studentId === student.id && reschedulingInfo?.originalClassId === classInstanceId;

    // Calculate reschedule options based on the parent classInstanceId
    const rescheduleOptions = useMemo(() => getRescheduleOptions(classInstanceId), [classInstanceId]);

    return (
        <div key={student.id} className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md ${student.isMakeup ? 'bg-blue-50' : 'bg-gray-50'}`}>
            {/* Student Name & Makeup/Reschedule Info */}
            <div className="mb-2 sm:mb-0 flex-1 pr-2">
                <span className="font-medium">{student.name}</span>
                {student.isMakeup && <span className="text-xs text-blue-600 font-semibold ml-2">(Makeup)</span>}
                {status === 'Rescheduled' && !student.isMakeup && rescheduledToClassId && rescheduledToDate && (
                    <span className="text-xs text-gray-500 ml-2 block sm:inline">
                        (Rescheduled to {mockClasses.find(c => c.id === rescheduledToClassId)?.name} on {format(parseISO(rescheduledToDate + 'T00:00:00'), 'MMM do')})
                    </span>
                )}
            </div>

            {/* Action Buttons & Status */}
            <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 text-xs rounded font-medium ${status === 'Present' ? 'bg-green-100 text-green-700' : status === 'Absent' ? 'bg-red-100 text-red-700' : status === 'Rescheduled' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>{status}</span>
                <button
                    title="Present"
                    className={`p-1 rounded ${status === 'Present' ? 'bg-green-200 text-green-700' : 'text-green-600 hover:bg-green-100'}`}
                    onClick={() => handleAttendanceChange(student.id, classInstanceId, 'Present')}
                    disabled={isCurrentlyRescheduling}
                >
                    <Check size={18} />
                </button>
                <button
                    title="Absent"
                    className={`p-1 rounded ${status === 'Absent' ? 'bg-red-200 text-red-700' : 'text-red-600 hover:bg-red-100'}`}
                    onClick={() => handleAttendanceChange(student.id, classInstanceId, 'Absent')}
                    disabled={isCurrentlyRescheduling}
                >
                    <X size={18} />
                </button>
                <button
                    title="Reschedule"
                    className={`p-1 rounded ${isCurrentlyRescheduling ? 'bg-blue-200 text-blue-700' : status === 'Rescheduled' ? 'bg-yellow-200 text-yellow-700' : 'text-blue-600 hover:bg-blue-100'}`}
                    onClick={() => handleRescheduleClick(student.id, student.name, classInstanceId)}
                    disabled={student.isMakeup}
                >
                    <CalendarIcon size={18} />
                </button>
            </div>

            {/* Reschedule Popup */} 
            {isCurrentlyRescheduling && (
                <div ref={reschedulePopupRef} className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-10">
                    <p className="text-sm font-medium mb-3">Reschedule {reschedulingInfo.studentName} from {classInstanceName}</p>
                    {/* Target Class Select */}
                    <div className="mb-3">
                        <label htmlFor={`reschedule-class-${student.id}`} className="block text-xs font-medium text-gray-700 mb-1">To Class:</label>
                        <select
                            id={`reschedule-class-${student.id}`}
                            value={rescheduleTargetClassId}
                            onChange={(e) => setRescheduleTargetClassId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="" disabled>Select target class...</option>
                            {rescheduleOptions.map(optionClass => (
                                <option key={optionClass.id} value={optionClass.id}>
                                    {optionClass.name} ({formatTime(optionClass.time.hour, optionClass.time.minute)}, {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][optionClass.time.dayOfWeek]})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Target Date Select (Using Calendar) */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">On Date:</label>
                        <Calendar
                            onChange={handleRescheduleDateChange}
                            value={rescheduleTargetDate}
                            tileDisabled={disableRescheduleDates}
                            minDate={new Date()}
                            className="react-calendar-reschedule mx-auto"
                        />
                        {rescheduleTargetDate && (
                            <p className="text-xs text-center mt-2">Selected: {format(rescheduleTargetDate, 'PPPP')}</p>
                        )}
                    </div>
                    {/* Confirm/Cancel Buttons */}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setReschedulingInfo(null)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReschedule}
                            disabled={!rescheduleTargetClassId || !rescheduleTargetDate || !selectedRescheduleClassInfo}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 