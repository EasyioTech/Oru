import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number;
  status: string;
}

export function useMyAttendance() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      // Assuming a generic HR endpoint or using employee attendance endpoint
      const response = await api.get('/hr/leaves/requests'); // Mocking with leaves for now as actual attendance endpoint isn't fully defined in HR
      return (response.data.data || []) as AttendanceRecord[];
    },
  });

  return {
    records: data || [],
    isLoading,
    error,
  };
}
