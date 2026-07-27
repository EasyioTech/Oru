import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';
import { useAuth } from '@/hooks/useAuth';

export function useMyProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile', userId],
    queryFn: () => fetchJson(`/hr/employees/${userId}`),
    enabled: !!userId
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => fetchMutate(`/hr/employees/${userId}`, 'PATCH', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile', userId] })
  });

  return { profile, isLoading, updateProfile };
}
