/**
 * Shared types for Attendance page
 */

export interface AttendanceRecord {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hours: string;
  employee_id?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface WeeklyTrend {
  date: string;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export interface DepartmentStats {
  department: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
}

export interface AttendanceInsight {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  count?: number;
}
