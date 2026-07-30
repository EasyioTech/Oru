import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type SystemSettings } from '@/services/api/system';
import { LoggingSection } from './LoggingSection';
import { BackupSection } from './BackupSection';

interface OtherTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: any) => void;
}

export function OtherTab({ formData, onChange }: OtherTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="support_email">Support Email</Label>
            <Input id="support_email" type="email" value={formData.support_email || ''} onChange={e => onChange('support_email', e.target.value)} placeholder="support@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support_phone">Support Phone</Label>
            <Input id="support_phone" value={formData.support_phone || ''} onChange={e => onChange('support_phone', e.target.value)} placeholder="+1 (555) 123-4567" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="support_address">Support Address</Label>
          <Textarea id="support_address" value={formData.support_address || ''} onChange={e => onChange('support_address', e.target.value)} placeholder="123 Main St, City, State, ZIP" rows={2} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input id="facebook_url" value={formData.facebook_url || ''} onChange={e => onChange('facebook_url', e.target.value)} placeholder="https://facebook.com/yourpage" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter_url">Twitter URL</Label>
            <Input id="twitter_url" value={formData.twitter_url || ''} onChange={e => onChange('twitter_url', e.target.value)} placeholder="https://twitter.com/yourhandle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" value={formData.linkedin_url || ''} onChange={e => onChange('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/yourcompany" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input id="instagram_url" value={formData.instagram_url || ''} onChange={e => onChange('instagram_url', e.target.value)} placeholder="https://instagram.com/yourhandle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube_url">YouTube URL</Label>
            <Input id="youtube_url" value={formData.youtube_url || ''} onChange={e => onChange('youtube_url', e.target.value)} placeholder="https://youtube.com/@yourchannel" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Legal & Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="terms_of_service_url">Terms of Service URL</Label>
            <Input id="terms_of_service_url" value={formData.terms_of_service_url || ''} onChange={e => onChange('terms_of_service_url', e.target.value)} placeholder="https://example.com/terms" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
            <Input id="privacy_policy_url" value={formData.privacy_policy_url || ''} onChange={e => onChange('privacy_policy_url', e.target.value)} placeholder="https://example.com/privacy" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cookie_policy_url">Cookie Policy URL</Label>
            <Input id="cookie_policy_url" value={formData.cookie_policy_url || ''} onChange={e => onChange('cookie_policy_url', e.target.value)} placeholder="https://example.com/cookies" />
          </div>
        </div>
      </div>

      <LoggingSection formData={formData} onChange={onChange} />
      <BackupSection formData={formData} onChange={onChange} />
    </div>
  );
}
