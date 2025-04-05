'use client';

import React, { useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { ClassInfo, Student, AttendanceStatus, DayOfWeek, DisplayStudent, ReschedulingInfo } from '../../lib/types';
import { mockClasses, getRescheduleOptions } from '../../lib/mockData';
import AttendanceStatusBadge from './AttendanceStatusBadge';
import AttendanceActionButtons from './AttendanceActionButtons';
import ReschedulePopup from './ReschedulePopup';

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
      <div className="flex items-center space-x-2">
        <AttendanceStatusBadge status={status} />
        <AttendanceActionButtons
          status={status}
          isCurrentlyRescheduling={isCurrentlyRescheduling}
          isMakeupStudent={student.isMakeup}
          onPresentClick={() => handleAttendanceChange(student.id, classInstanceId, 'Present')}
          onAbsentClick={() => handleAttendanceChange(student.id, classInstanceId, 'Absent')}
          onRescheduleClick={() => handleRescheduleClick(student.id, student.name, classInstanceId)}
        />
      </div>

      {/* Reschedule Popup */} 
      {isCurrentlyRescheduling && (
        <ReschedulePopup
          studentName={reschedulingInfo.studentName}
          classInstanceName={classInstanceName}
          rescheduleTargetClassId={rescheduleTargetClassId}
          rescheduleTargetDate={rescheduleTargetDate}
          selectedRescheduleClassInfo={selectedRescheduleClassInfo}
          rescheduleOptions={rescheduleOptions}
          onClassChange={setRescheduleTargetClassId}
          onDateChange={handleRescheduleDateChange}
          onCancel={() => setReschedulingInfo(null)}
          onConfirm={confirmReschedule}
          disableRescheduleDates={disableRescheduleDates}
        />
      )}
    </div>
  );
} 