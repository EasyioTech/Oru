import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type SystemSettings } from '@/services/api/system';

interface EmailTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function EmailTab({ formData, onChange }: EmailTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Email Service Provider</h3>
      <div className="space-y-2">
        <Label htmlFor="email_provider">Provider</Label>
        <Select value={formData.email_provider || 'smtp'} onValueChange={v => onChange('email_provider', v)}>
          <SelectTrigger><SelectValue placeholder="Select email provider" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="smtp">SMTP Server</SelectItem>
            <SelectItem value="sendgrid">SendGrid</SelectItem>
            <SelectItem value="mailgun">Mailgun</SelectItem>
            <SelectItem value="aws_ses">AWS SES</SelectItem>
            <SelectItem value="resend">Resend</SelectItem>
            <SelectItem value="postmark">Postmark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.email_provider === 'smtp' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">SMTP Host</Label>
            <Input id="smtp_host" value={formData.smtp_host || ''} onChange={e => onChange('smtp_host', e.target.value)} placeholder="smtp.example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_port">SMTP Port</Label>
            <Input id="smtp_port" type="number" value={formData.smtp_port || 587} onChange={e => onChange('smtp_port', parseInt(e.target.value) || 587)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_user">SMTP User</Label>
            <Input id="smtp_user" value={formData.smtp_user || ''} onChange={e => onChange('smtp_user', e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_password">SMTP Password</Label>
            <Input id="smtp_password" type="password" value={formData.smtp_password || ''} onChange={e => onChange('smtp_password', e.target.value)} placeholder={formData.smtp_password === '***' ? '••••••••' : 'Enter password'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_from">From Email</Label>
            <Input id="smtp_from" value={formData.smtp_from || ''} onChange={e => onChange('smtp_from', e.target.value)} placeholder="noreply@example.com" />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Switch id="smtp_secure" checked={formData.smtp_secure || false} onCheckedChange={c => onChange('smtp_secure', c)} />
            <Label htmlFor="smtp_secure">Use SSL/TLS</Label>
          </div>
        </div>
      )}

      {formData.email_provider === 'sendgrid' && (
        <div className="space-y-4 border rounded-md p-4">
          <div className="space-y-2">
            <Label htmlFor="sendgrid_api_key">SendGrid API Key</Label>
            <Input id="sendgrid_api_key" type="password" value={formData.sendgrid_api_key || ''} onChange={e => onChange('sendgrid_api_key', e.target.value)} placeholder={formData.sendgrid_api_key === '***' ? '••••••••' : 'Enter API Key'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sendgrid_from">From Email</Label>
            <Input id="sendgrid_from" value={formData.sendgrid_from || ''} onChange={e => onChange('sendgrid_from', e.target.value)} placeholder="noreply@example.com" />
          </div>
        </div>
      )}

      {formData.email_provider === 'mailgun' && (
        <div className="space-y-4 border rounded-md p-4">
          <div className="space-y-2">
            <Label htmlFor="mailgun_api_key">Mailgun API Key</Label>
            <Input id="mailgun_api_key" type="password" value={formData.mailgun_api_key || ''} onChange={e => onChange('mailgun_api_key', e.target.value)} placeholder={formData.mailgun_api_key === '***' ? '••••••••' : 'Enter API Key'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mailgun_domain">Mailgun Domain</Label>
            <Input id="mailgun_domain" value={formData.mailgun_domain || ''} onChange={e => onChange('mailgun_domain', e.target.value)} placeholder="mg.example.com" />
          </div>
        </div>
      )}

      {formData.email_provider === 'aws_ses' && (
        <div className="space-y-4 border rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aws_ses_region">AWS Region</Label>
              <Input id="aws_ses_region" value={formData.aws_ses_region || ''} onChange={e => onChange('aws_ses_region', e.target.value)} placeholder="us-east-1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aws_access_key_id">Access Key ID</Label>
              <Input id="aws_access_key_id" value={formData.aws_access_key_id || ''} onChange={e => onChange('aws_access_key_id', e.target.value)} placeholder={formData.aws_access_key_id === '***' ? '••••••••' : 'Enter Access Key'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aws_secret_access_key">Secret Access Key</Label>
              <Input id="aws_secret_access_key" type="password" value={formData.aws_secret_access_key || ''} onChange={e => onChange('aws_secret_access_key', e.target.value)} placeholder={formData.aws_secret_access_key === '***' ? '••••••••' : 'Enter Secret Key'} />
            </div>
          </div>
        </div>
      )}

      {formData.email_provider === 'resend' && (
        <div className="space-y-4 border rounded-md p-4">
          <div className="space-y-2">
            <Label htmlFor="resend_api_key">Resend API Key</Label>
            <Input id="resend_api_key" type="password" value={formData.resend_api_key || ''} onChange={e => onChange('resend_api_key', e.target.value)} placeholder={formData.resend_api_key === '***' ? '••••••••' : 'Enter API Key'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resend_from">From Email</Label>
            <Input id="resend_from" value={formData.resend_from || ''} onChange={e => onChange('resend_from', e.target.value)} placeholder="onboarding@resend.dev" />
          </div>
        </div>
      )}

      {formData.email_provider === 'postmark' && (
        <div className="space-y-4 border rounded-md p-4">
          <p className="text-sm text-muted-foreground">Postmark configuration not yet fully implemented in UI.</p>
        </div>
      )}
    </div>
  );
}
