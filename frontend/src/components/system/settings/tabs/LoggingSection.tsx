import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type SystemSettings } from '@/services/api/system';

interface LoggingSectionProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function LoggingSection({ formData, onChange }: LoggingSectionProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Logging & Monitoring
      </h3>
      <div className="space-y-2">
        <Label htmlFor="log_level">Log Level</Label>
        <select
          id="log_level"
          value={formData.log_level || 'info'}
          onChange={e => onChange('log_level', e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="log_retention_days">Log Retention (Days)</Label>
          <Input id="log_retention_days" type="number" value={formData.log_retention_days || 30} onChange={e => onChange('log_retention_days', parseInt(e.target.value) || 30)} min="1" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable_audit_logging" className="cursor-pointer">Enable Audit Logging</Label>
          <Switch id="enable_audit_logging" checked={formData.enable_audit_logging ?? true} onCheckedChange={c => onChange('enable_audit_logging', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="enable_error_tracking" className="cursor-pointer">Enable Error Tracking (Sentry)</Label>
          <Switch id="enable_error_tracking" checked={formData.enable_error_tracking || false} onCheckedChange={c => onChange('enable_error_tracking', c)} />
        </div>
        {formData.enable_error_tracking && (
          <div className="space-y-2">
            <Label htmlFor="sentry_dsn">Sentry DSN</Label>
            <Input id="sentry_dsn" type="password" value={formData.sentry_dsn || ''} onChange={e => onChange('sentry_dsn', e.target.value)} placeholder="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <Label htmlFor="enable_performance_monitoring" className="cursor-pointer">Enable Performance Monitoring</Label>
          <Switch id="enable_performance_monitoring" checked={formData.enable_performance_monitoring || false} onCheckedChange={c => onChange('enable_performance_monitoring', c)} />
        </div>
      </div>
    </div>
  );
}
