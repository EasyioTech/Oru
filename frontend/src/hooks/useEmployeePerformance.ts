import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/utils/authApi';
import { format } from 'date-fns';

export function useEmployeePerformance(employeeId: string | null, period = 'monthly', customDateRange?: any) {
  const getDateRange = () => {
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth(), 1);
    let end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (period === 'daily') { start = today; end = today; }
    else if (period === 'weekly') { start = new Date(today); start.setDate(today.getDate() - 6); end = today; }
    else if (period === 'yearly') { start = new Date(today.getFullYear(), 0, 1); end = new Date(today.getFullYear(), 11, 31); }
    else if (period === 'custom' && customDateRange?.from && customDateRange?.to) { start = customDateRange.from; end = customDateRange.to; }
    
    return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') };
  };

  const { startDate, endDate } = getDateRange();
  const qs = `?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}&period=${period}`;

  const { data: summary, isLoading: sLoading } = useQuery({
    queryKey: ['perf-summary', employeeId, startDate, endDate],
    queryFn: () => fetchJson(`/hr/performance/summary${qs}`),
    enabled: !!employeeId
  });

  const { data: tasks, isLoading: tLoading } = useQuery({
    queryKey: ['perf-tasks', employeeId, startDate, endDate],
    queryFn: () => fetchJson(`/hr/performance/tasks${qs}`),
    enabled: !!employeeId
  });

  const { data: hours, isLoading: hLoading } = useQuery({
    queryKey: ['perf-hours', employeeId, startDate, endDate],
    queryFn: () => fetchJson(`/hr/performance/hours${qs}`),
    enabled: !!employeeId
  });

  return { summary, tasks, hours, isLoading: sLoading || tLoading || hLoading };
}
