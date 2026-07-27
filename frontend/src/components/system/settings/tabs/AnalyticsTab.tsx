import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SystemSettings } from '@/services/api/system';

interface AnalyticsTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function AnalyticsTab({ formData, onChange }: AnalyticsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
          <Input id="google_analytics_id" value={formData.google_analytics_id || ''} onChange={e => onChange('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
          <Input id="google_tag_manager_id" value={formData.google_tag_manager_id || ''} onChange={e => onChange('google_tag_manager_id', e.target.value)} placeholder="GTM-XXXXXXX" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
        <Input id="facebook_pixel_id" value={formData.facebook_pixel_id || ''} onChange={e => onChange('facebook_pixel_id', e.target.value)} placeholder="123456789012345" />
      </div>
    </div>
  );
}
