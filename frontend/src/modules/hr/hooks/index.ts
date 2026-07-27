import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Employees ───────────────────────────────────────────────────────────────

export const useEmployees = (filters?: { departmentId?: string; status?: string; search?: string }) =>
  useQuery({
    queryKey: ['hr_employees', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/hr/employees${query ? `?${query}` : ''}`);
    },
  });

export const useEmployee = (id: string) =>
  useQuery({
    queryKey: ['hr_employees', id],
    queryFn: () => fetchJson(`/hr/employees/${id}`),
    enabled: !!id,
  });

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/hr/employees', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_employees'] }),
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/hr/employees/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['hr_employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr_employees', id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/hr/employees/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_employees'] }),
  });
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const useDepartments = () =>
  useQuery({
    queryKey: ['hr_departments'],
    queryFn: () => fetchJson('/hr/departments'),
    staleTime: 1000 * 60 * 10, // departments change rarely — 10min cache
  });

export const useDepartment = (id: string) =>
  useQuery({
    queryKey: ['hr_departments', id],
    queryFn: () => fetchJson(`/hr/departments/${id}`),
    enabled: !!id,
  });

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/hr/departments', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_departments'] }),
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/hr/departments/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['hr_departments'] });
      queryClient.invalidateQueries({ queryKey: ['hr_departments', id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/hr/departments/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_departments'] }),
  });
};

// ─── Leave Requests ───────────────────────────────────────────────────────────

export const useLeaveRequests = (filters?: { status?: string; employeeId?: string }) =>
  useQuery({
    queryKey: ['hr_leave', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/hr/leave${query ? `?${query}` : ''}`);
    },
  });

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/hr/leave', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_leave'] }),
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/hr/leave/${id}`, 'PUT', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_leave'] }),
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/hr/leave/${id}/approve`, 'POST'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_leave'] }),
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      fetchMutate(`/hr/leave/${id}/reject`, 'POST', { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_leave'] }),
  });
};

// ─── Attendance ────────────────────────────────────────────────────────────────

export const useAttendance = (filters?: { employeeId?: string; month?: string; year?: string }) =>
  useQuery({
    queryKey: ['hr_attendance', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/hr/attendance${query ? `?${query}` : ''}`);
    },
  });

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/hr/attendance/check-in', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_attendance'] }),
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/hr/attendance/check-out', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr_attendance'] }),
  });
};

// ─── HR Metrics ────────────────────────────────────────────────────────────────

export const useHrMetrics = () =>
  useQuery({
    queryKey: ['hr_metrics'],
    queryFn: () => fetchJson('/hr/metrics'),
  });
