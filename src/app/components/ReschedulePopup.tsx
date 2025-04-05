'use client';

import React from 'react';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import { ClassInfo } from '../../lib/types';
import { formatTime, getDayName } from '../../lib/utils';

interface ReschedulePopupProps {
  studentName: string;
  classInstanceName: string;
  rescheduleTargetClassId: string;
  rescheduleTargetDate: Date | null;
  selectedRescheduleClassInfo: ClassInfo | null;
  rescheduleOptions: ClassInfo[];
  onClassChange: (classId: string) => void;
  onDateChange: (value: unknown) => void;
  onCancel: () => void;
  onConfirm: () => void;
  disableRescheduleDates: ({ date, view }: { date: Date, view: string }) => boolean;
}

export default function ReschedulePopup({
  studentName,
  classInstanceName,
  rescheduleTargetClassId,
  rescheduleTargetDate,
  selectedRescheduleClassInfo,
  rescheduleOptions,
  onClassChange,
  onDateChange,
  onCancel,
  onConfirm,
  disableRescheduleDates
}: ReschedulePopupProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-10">
      <p className="text-sm font-medium mb-3">Reschedule {studentName} from {classInstanceName}</p>
      
      {/* Target Class Select */}
      <div className="mb-3">
        <label htmlFor="reschedule-class" className="block text-xs font-medium text-gray-700 mb-1">To Class:</label>
        <select
          id="reschedule-class"
          value={rescheduleTargetClassId}
          onChange={(e) => onClassChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="" disabled>Select target class...</option>
          {rescheduleOptions.map(optionClass => (
            <option key={optionClass.id} value={optionClass.id}>
              {optionClass.name} ({formatTime(optionClass.time.hour, optionClass.time.minute)}, {getDayName(optionClass.time.dayOfWeek)})
            </option>
          ))}
        </select>
      </div>
      
      {/* Target Date Select (Using Calendar) */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">On Date:</label>
        <Calendar
          onChange={onDateChange}
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
          onClick={onCancel}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!rescheduleTargetClassId || !rescheduleTargetDate || !selectedRescheduleClassInfo}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </div>
  );
} 