import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useClockInOut() {
  const queryClient = useQueryClient();
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'available' | 'unavailable' | 'denied'>('available');

  const { data: todayAttendance, isLoading: loading } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: async () => (await api.get('/hr/attendance/today')).data.data || null,
  });

  const { mutateAsync: handleClockIn } = useMutation({
    mutationFn: async () => api.post('/hr/attendance/clock-in', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-today'] }),
  });

  const { mutateAsync: handleClockOut } = useMutation({
    mutationFn: async () => api.post('/hr/attendance/clock-out', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-today'] }),
  });

  return {
    loading, fetchingLocation, todayAttendance, currentTime: new Date(), locationStatus, isOnline: true,
    canClockIn: !todayAttendance?.check_in_time, 
    canClockOut: !!(todayAttendance?.check_in_time && !todayAttendance?.check_out_time), 
    isCompleted: !!todayAttendance?.check_out_time, 
    elapsedTime: null,
    handleClockIn, handleClockOut,
  };
}
