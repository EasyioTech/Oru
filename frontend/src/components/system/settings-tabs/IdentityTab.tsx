/**
 * System Settings - Identity tab
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SystemSettings } from '@/services/api/system';

interface IdentityTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function IdentityTab({ formData, onChange }: IdentityTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="system_name">System Name *</Label>
          <Input
            id="system_name"
            value={formData.system_name || ''}
            onChange={(e) => onChange('system_name', e.target.value)}
            placeholder="Oru ERP"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="system_tagline">System Tagline</Label>
          <Input
            id="system_tagline"
            value={formData.system_tagline || ''}
            onChange={(e) => onChange('system_tagline', e.target.value)}
            placeholder="Complete Business Management Solution"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="system_description">System Description</Label>
        <Textarea
          id="system_description"
          value={formData.system_description || ''}
          onChange={(e) => onChange('system_description', e.target.value)}
          placeholder="A comprehensive ERP system for managing your business operations"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="default_language">Default Language</Label>
          <Input
            id="default_language"
            value={formData.default_language || 'en'}
            onChange={(e) => onChange('default_language', e.target.value)}
            placeholder="en"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_timezone">Default Timezone</Label>
          <Input
            id="default_timezone"
            value={formData.default_timezone || 'UTC'}
            onChange={(e) => onChange('default_timezone', e.target.value)}
            placeholder="UTC"
          />
        </div>
      </div>
    </div>
  );
}
