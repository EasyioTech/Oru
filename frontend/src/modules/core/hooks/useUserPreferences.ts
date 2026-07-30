import { useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { dashboardStore, UserPreferences } from '../stores/dashboardStore';

export function useUserPreferences() {
  const preferences = dashboardStore((state) => state.preferences);
  const updatePreference = dashboardStore((state) => state.updatePreference);

  // Mutation to sync preferences to backend
  const { mutate: syncToBackend } = useMutation({
    mutationFn: async (prefs: Partial<UserPreferences>) => {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
  });

  const updateAndSync = useCallback(
    (key: keyof UserPreferences, value: any) => {
      // Optimistic update (instant)
      updatePreference(key, value);
      // Sync to backend (debounced in practice, here we just fire it)
      syncToBackend({ [key]: value });
    },
    [updatePreference, syncToBackend]
  );

  return {
    theme: preferences.theme,
    density: preferences.density,
    notificationFrequency: preferences.notificationFrequency,
    dashboardRefreshInterval: preferences.dashboardRefreshInterval,
    updatePreference: updateAndSync,
  };
}
