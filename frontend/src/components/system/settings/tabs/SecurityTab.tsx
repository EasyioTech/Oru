import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type SystemSettings } from '@/services/api/system';

interface SecurityTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function SecurityTab({ formData, onChange }: SecurityTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Password Policy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password_min_length">Minimum Length</Label>
          <Input id="password_min_length" type="number" value={formData.password_min_length ?? 8} onChange={e => onChange('password_min_length', parseInt(e.target.value, 10) || 8)} min={6} max={128} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_expiry_days">Expiry (days, 0 = never)</Label>
          <Input id="password_expiry_days" type="number" value={formData.password_expiry_days ?? 90} onChange={e => onChange('password_expiry_days', parseInt(e.target.value, 10) ?? 90)} min={0} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="password_require_uppercase" className="cursor-pointer">Require uppercase</Label>
          <Switch id="password_require_uppercase" checked={formData.password_require_uppercase ?? true} onCheckedChange={c => onChange('password_require_uppercase', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password_require_lowercase" className="cursor-pointer">Require lowercase</Label>
          <Switch id="password_require_lowercase" checked={formData.password_require_lowercase ?? true} onCheckedChange={c => onChange('password_require_lowercase', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password_require_numbers" className="cursor-pointer">Require numbers</Label>
          <Switch id="password_require_numbers" checked={formData.password_require_numbers ?? true} onCheckedChange={c => onChange('password_require_numbers', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password_require_symbols" className="cursor-pointer">Require symbols</Label>
          <Switch id="password_require_symbols" checked={formData.password_require_symbols || false} onCheckedChange={c => onChange('password_require_symbols', c)} />
        </div>
      </div>

      <h3 className="text-lg font-semibold pt-4">Session & Login</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="session_timeout_minutes">Session timeout (minutes)</Label>
          <Input id="session_timeout_minutes" type="number" value={formData.session_timeout_minutes ?? 60} onChange={e => onChange('session_timeout_minutes', parseInt(e.target.value, 10) || 60)} min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_login_attempts">Max login attempts</Label>
          <Input id="max_login_attempts" type="number" value={formData.max_login_attempts ?? 5} onChange={e => onChange('max_login_attempts', parseInt(e.target.value, 10) || 5)} min={1} max={20} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lockout_duration_minutes">Lockout duration (minutes)</Label>
          <Input id="lockout_duration_minutes" type="number" value={formData.lockout_duration_minutes ?? 30} onChange={e => onChange('lockout_duration_minutes', parseInt(e.target.value, 10) || 30)} min={1} />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="require_email_verification" className="cursor-pointer">Require email verification</Label>
          <Switch id="require_email_verification" checked={formData.require_email_verification ?? true} onCheckedChange={c => onChange('require_email_verification', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="enable_two_factor" className="cursor-pointer">Enable two-factor auth</Label>
          <Switch id="enable_two_factor" checked={formData.enable_two_factor || false} onCheckedChange={c => onChange('enable_two_factor', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="enable_captcha" className="cursor-pointer">Enable CAPTCHA</Label>
          <Switch id="enable_captcha" checked={formData.enable_captcha || false} onCheckedChange={c => onChange('enable_captcha', c)} />
        </div>
        {formData.enable_captcha && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="captcha_site_key">CAPTCHA site key</Label>
              <Input id="captcha_site_key" value={formData.captcha_site_key || ''} onChange={e => onChange('captcha_site_key', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="captcha_secret_key">CAPTCHA secret key</Label>
              <Input id="captcha_secret_key" type="password" value={formData.captcha_secret_key === '***' ? '' : (formData.captcha_secret_key || '')} onChange={e => onChange('captcha_secret_key', e.target.value)} placeholder="Leave blank to keep current" />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Label htmlFor="enable_rate_limiting" className="cursor-pointer">Enable rate limiting</Label>
          <Switch id="enable_rate_limiting" checked={formData.enable_rate_limiting ?? true} onCheckedChange={c => onChange('enable_rate_limiting', c)} />
        </div>
        {formData.enable_rate_limiting && (
          <div className="space-y-2">
            <Label htmlFor="rate_limit_requests_per_minute">Requests per minute</Label>
            <Input id="rate_limit_requests_per_minute" type="number" value={formData.rate_limit_requests_per_minute ?? 60} onChange={e => onChange('rate_limit_requests_per_minute', parseInt(e.target.value, 10) || 60)} min={1} max={10000} />
          </div>
        )}
      </div>
    </div>
  );
}
