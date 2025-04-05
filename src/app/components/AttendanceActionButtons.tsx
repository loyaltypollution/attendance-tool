'use client';

import React from 'react';
import { Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { AttendanceStatus } from '../../lib/types';

interface AttendanceActionButtonsProps {
  status: AttendanceStatus;
  isCurrentlyRescheduling: boolean;
  isMakeupStudent: boolean;
  onPresentClick: () => void;
  onAbsentClick: () => void;
  onRescheduleClick: () => void;
}

export default function AttendanceActionButtons({
  status,
  isCurrentlyRescheduling,
  isMakeupStudent,
  onPresentClick,
  onAbsentClick,
  onRescheduleClick
}: AttendanceActionButtonsProps) {
  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      <button
        title="Present"
        className={`p-1 rounded ${status === 'Present' ? 'bg-green-200 text-green-700' : 'text-green-600 hover:bg-green-100'}`}
        onClick={onPresentClick}
        disabled={isCurrentlyRescheduling}
      >
        <Check size={18} />
      </button>
      <button
        title="Absent"
        className={`p-1 rounded ${status === 'Absent' ? 'bg-red-200 text-red-700' : 'text-red-600 hover:bg-red-100'}`}
        onClick={onAbsentClick}
        disabled={isCurrentlyRescheduling}
      >
        <X size={18} />
      </button>
      <button
        title="Reschedule"
        className={`p-1 rounded ${isCurrentlyRescheduling ? 'bg-blue-200 text-blue-700' : status === 'Rescheduled' ? 'bg-yellow-200 text-yellow-700' : 'text-blue-600 hover:bg-blue-100'}`}
        onClick={onRescheduleClick}
        disabled={isMakeupStudent}
      >
        <CalendarIcon size={18} />
      </button>
    </div>
  );
} 