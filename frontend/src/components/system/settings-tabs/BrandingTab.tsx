/**
 * System Settings - Branding tab
 */

import { Image } from 'lucide-react';
import { BrandingImageUpload } from '../BrandingImageUpload';
import type { SystemSettings } from '@/services/api/system';

interface BrandingTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function BrandingTab({ formData, onChange }: BrandingTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Image className="h-4 w-4" />
          Icons & Favicons
        </h3>
        <p className="text-xs text-muted-foreground">
          Customize the favicon and theme-aware app logos. Upload PNG, JPG, SVG, or ICO — or enter a URL. Leave empty to use defaults.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <BrandingImageUpload
            label="Favicon"
            value={formData.favicon_url || ''}
            onChange={(v) => onChange('favicon_url', v)}
            placeholder="/images/landing/light.svg or URL"
            helpText="Shown in browser tab. Default: light logo."
            maxSizeMB={2}
          />
          <BrandingImageUpload
            label="Logo (Light Mode)"
            value={formData.logo_light_url || ''}
            onChange={(v) => onChange('logo_light_url', v)}
            placeholder="/images/landing/light.svg or URL"
            helpText="Sidebar, auth, nav when theme is light."
          />
          <BrandingImageUpload
            label="Logo (Dark Mode)"
            value={formData.logo_dark_url || ''}
            onChange={(v) => onChange('logo_dark_url', v)}
            placeholder="/images/landing/logo.svg or URL"
            helpText="Sidebar, auth, nav when theme is dark."
          />
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <h3 className="text-sm font-semibold">App Logos</h3>
        <p className="text-xs text-muted-foreground">
          Main logo, login page, and email templates. Upload or enter URL.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <BrandingImageUpload
            label="Main Logo"
            value={formData.logo_url || ''}
            onChange={(v) => onChange('logo_url', v)}
            placeholder="https://example.com/logo.png"
          />
          <BrandingImageUpload
            label="Login Logo"
            value={formData.login_logo_url || ''}
            onChange={(v) => onChange('login_logo_url', v)}
            placeholder="https://example.com/login-logo.png"
            helpText="Shown on login page."
          />
          <BrandingImageUpload
            label="Email Logo"
            value={formData.email_logo_url || ''}
            onChange={(v) => onChange('email_logo_url', v)}
            placeholder="https://example.com/email-logo.png"
            helpText="Used in email templates."
          />
        </div>
      </div>
    </div>
  );
}
