import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchSystemSettings, updateSystemSettings, type SystemSettings } from '@/services/api/system';
import { useBranding } from '@/contexts/BrandingContext';

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});
  const [activeTab, setActiveTab] = useState('identity');
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const { toast } = useToast();
  const { refreshBranding } = useBranding();

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchSystemSettings();
      setSettings(data);
      setFormData(data);
      setIsDirty(false);
    } catch (error: unknown) {
      toast({
        title: 'Error Loading Settings',
        description: (error as Error).message || 'Failed to load system settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const changedData: Partial<SystemSettings> = {};
      if (settings) {
        Object.entries(formData).forEach(([key, value]) => {
          const k = key as keyof SystemSettings;
          if (JSON.stringify(value) !== JSON.stringify(settings[k])) {
            (changedData as Record<string, unknown>)[k] = value;
          }
        });
      }
      const payload = Object.keys(changedData).length > 0 ? changedData : formData;
      const updated = await updateSystemSettings(payload);
      setSettings(updated);
      setFormData(updated);
      setIsDirty(false);
      await refreshBranding();
      toast({ title: 'Settings Saved', description: 'System settings have been updated successfully.' });
    } catch (error: unknown) {
      toast({
        title: 'Error Saving Settings',
        description: (error as Error).message || 'Failed to save system settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SystemSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleTabChange = (value: string) => {
    if (isDirty) { setPendingTab(value); setShowConfirm(true); }
    else setActiveTab(value);
  };

  const handleDiscardChanges = () => {
    if (settings) { setFormData(settings); setIsDirty(false); }
    if (pendingTab) { setActiveTab(pendingTab); setPendingTab(null); }
    setShowConfirm(false);
  };

  const handleConfirmSave = async () => {
    await handleSave();
    if (pendingTab) { setActiveTab(pendingTab); setPendingTab(null); }
    setShowConfirm(false);
  };

  useEffect(() => { loadSettings(); }, []);

  return {
    settings, loading, saving, formData, activeTab, isDirty,
    showConfirm, pendingTab, setPendingTab, setShowConfirm,
    loadSettings, handleSave, handleChange, handleTabChange,
    handleDiscardChanges, handleConfirmSave,
  };
}

export type UseSystemSettingsReturn = ReturnType<typeof useSystemSettings>;
