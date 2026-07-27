export interface AttendanceRecord {
  id: string;
  user_id?: string;
  employee_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  hours_worked?: number | null;
  total_hours: number | null;
  location: string | null;
  status: string;
  overtime_hours?: number | null;
  agency_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
}

export type LocationStatus = 'checking' | 'available' | 'unavailable' | 'denied';

export interface ClockInOutProps {
  compact?: boolean;
}
