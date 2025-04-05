'use client';

import React from 'react';
import { AttendanceStatus } from '../../lib/types';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
}

export default function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  const getStatusStyles = (status: AttendanceStatus): string => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700';
      case 'Absent':
        return 'bg-red-100 text-red-700';
      case 'Rescheduled':
        return 'bg-yellow-100 text-yellow-700';
      case 'Pending':
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
} 