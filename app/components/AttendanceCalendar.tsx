'use client';

import React from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css'; // Ensure styles are imported if not globally available

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface AttendanceCalendarProps {
  selectedDate: Date;
  onDateChange: (value: Value) => void;
}

export default function AttendanceCalendar({ selectedDate, onDateChange }: AttendanceCalendarProps) {
  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Select Date</h2>
      {/* Basic Calendar integration - styling can be customized */}
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
        className="react-calendar-custom mx-auto"
        // Add any other necessary props like tileDisabled if needed for the main calendar
      />
      <p className="text-center mt-4 font-medium">Selected: {format(selectedDate, 'PPPP')}</p>
    </div>
  );
} 