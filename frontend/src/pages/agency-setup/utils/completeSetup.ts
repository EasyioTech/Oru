import { getApiBaseUrl } from '@/config/api';
import type { AgencySetupFormData } from '../types';

export async function completeAgencySetup(formData: AgencySetupFormData): Promise<{ teamCredentialsCsv?: string }> {
  const apiBaseUrl = getApiBaseUrl();
  const agencyDatabase = localStorage.getItem('agency_database');

  let logoBase64: string | null = null;
  if (formData.logo) {
    logoBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(formData.logo!);
    });
  }

  const normalizedTeamMembers = formData.teamMembers.map((member) => ({
    ...member,
    role: 'department_head',
  }));

  const response = await fetch(`${apiBaseUrl}/api/agencies/complete-setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      'X-Agency-Database': agencyDatabase || '',
    },
    body: JSON.stringify({
      ...formData,
      teamMembers: normalizedTeamMembers,
      logo: logoBase64,
      database: agencyDatabase,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to complete setup');
  }

  const result = await response.json().catch(() => ({} as { teamCredentialsCsv?: string }));

  if (result?.teamCredentialsCsv) {
    try {
      const blob = new Blob([result.teamCredentialsCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'department-head-credentials.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Failed to trigger CSV download for team credentials:', e);
    }
  }

  return result;
}
