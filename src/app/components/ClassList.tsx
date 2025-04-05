'use client';

import React from 'react';
import { format } from 'date-fns';
import { EffectiveClassInstance, ReschedulingInfo, AttendanceStatus } from '../../lib/types';
import ClassCard from './ClassCard';

interface ClassListProps {
  classes: EffectiveClassInstance[];
  formattedSelectedDate: string;
  reschedulingInfo: ReschedulingInfo | null;
  rescheduleTargetClassId: string;
  rescheduleTargetDate: Date | null;
  selectedRescheduleClassInfo: any | null;
  getStudentAttendanceDetails: (studentId: string, classId: string, date: string) => { 
    status: AttendanceStatus; 
    rescheduledToClassId?: string; 
    rescheduledToDate?: string 
  };
  handleAttendanceChange: (
    studentId: string, 
    classId: string, 
    newStatus: AttendanceStatus, 
    rescheduleTarget?: { classId: string; date: string }
  ) => void;
  handleRescheduleClick: (studentId: string, studentName: string, classId: string) => void;
  confirmReschedule: () => void;
  setReschedulingInfo: (info: ReschedulingInfo | null) => void;
  setRescheduleTargetClassId: (id: string) => void;
  setRescheduleTargetDate: (date: Date | null) => void;
  disableRescheduleDates: ({ date, view }: { date: Date, view: string }) => boolean;
  handleRescheduleDateChange: (value: unknown) => void;
}

export default function ClassList({
  classes,
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
}: ClassListProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Classes for {format(new Date(formattedSelectedDate), 'EEEE, MMMM do')}</h2>
      {classes.length === 0 ? (
        <p className="text-gray-500 italic">No classes scheduled for this day.</p>
      ) : (
        <div className="space-y-6">
          {classes.map((classInstance) => (
            <ClassCard
              key={classInstance.id}
              classInstance={classInstance}
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
          ))}
        </div>
      )}
    </div>
  );
} 