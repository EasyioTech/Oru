import { Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type SystemSettings } from '@/services/api/system';

interface BackupSectionProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function BackupSection({ formData, onChange }: BackupSectionProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Archive className="h-5 w-5" />
        Backup Configuration
      </h3>
      <div className="flex items-center justify-between">
        <Label htmlFor="enable_auto_backup" className="cursor-pointer">Enable Automatic Backups</Label>
        <Switch id="enable_auto_backup" checked={formData.enable_auto_backup ?? true} onCheckedChange={c => onChange('enable_auto_backup', c)} />
      </div>
      {formData.enable_auto_backup && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="backup_frequency_hours">Backup Frequency (Hours)</Label>
            <Input id="backup_frequency_hours" type="number" value={formData.backup_frequency_hours || 24} onChange={e => onChange('backup_frequency_hours', parseInt(e.target.value) || 24)} min="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backup_retention_days">Backup Retention (Days)</Label>
            <Input id="backup_retention_days" type="number" value={formData.backup_retention_days || 7} onChange={e => onChange('backup_retention_days', parseInt(e.target.value) || 7)} min="1" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="backup_storage_path">Backup Storage Path</Label>
            <Input id="backup_storage_path" value={formData.backup_storage_path || '/app/backups'} onChange={e => onChange('backup_storage_path', e.target.value)} placeholder="/app/backups" />
          </div>
        </div>
      )}
    </div>
  );
}
