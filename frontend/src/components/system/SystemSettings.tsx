import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, RefreshCw, Settings, Search, Tag, Megaphone, Mail, Globe, Shield, Lock, Database, HardDrive, Code, FileText, Server, Archive, Key } from 'lucide-react';
import { fetchSystemSettings, updateSystemSettings, type SystemSettings } from '@/services/api/system';
import { IdentityTab, BrandingTab } from './settings-tabs';
import { useBranding } from '@/contexts/BrandingContext';

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});
  const { toast } = useToast();
  const { refreshBranding } = useBranding();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchSystemSettings();
      setSettings(data);
      setFormData(data);
    } catch (error: any) {
      toast({
        title: 'Error Loading Settings',
        description: error.message || 'Failed to load system settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateSystemSettings(formData);
      setSettings(updated);
      setFormData(updated);

      // Refresh branding context to update logo/title immediately
      await refreshBranding();

      toast({
        title: 'Settings Saved',
        description: 'System settings have been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error Saving Settings',
        description: error.message || 'Failed to save system settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings for branding, SEO, analytics, and more
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadSettings} disabled={loading || saving}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="identity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4">
              <IdentityTab formData={formData} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <BrandingTab formData={formData} onChange={handleChange} />
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title || ''}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  placeholder="Oru ERP - Complete Business Management"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ''}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  placeholder="A comprehensive ERP system for managing your business operations"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords (comma-separated)</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords || ''}
                  onChange={(e) => handleChange('meta_keywords', e.target.value)}
                  placeholder="ERP, business management, CRM, accounting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og_image_url">Open Graph Image URL</Label>
                <Input
                  id="og_image_url"
                  value={formData.og_image_url || ''}
                  onChange={(e) => handleChange('og_image_url', e.target.value)}
                  placeholder="https://example.com/og-image.png"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="og_title">Open Graph Title</Label>
                  <Input
                    id="og_title"
                    value={formData.og_title || ''}
                    onChange={(e) => handleChange('og_title', e.target.value)}
                    placeholder="Oru ERP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_description">Open Graph Description</Label>
                  <Input
                    id="og_description"
                    value={formData.og_description || ''}
                    onChange={(e) => handleChange('og_description', e.target.value)}
                    placeholder="Complete Business Management Solution"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter_card_type">Twitter Card Type</Label>
                  <Input
                    id="twitter_card_type"
                    value={formData.twitter_card_type || 'summary_large_image'}
                    onChange={(e) => handleChange('twitter_card_type', e.target.value)}
                    placeholder="summary_large_image"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter_site">Twitter Site</Label>
                  <Input
                    id="twitter_site"
                    value={formData.twitter_site || ''}
                    onChange={(e) => handleChange('twitter_site', e.target.value)}
                    placeholder="@oru"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter_creator">Twitter Creator</Label>
                  <Input
                    id="twitter_creator"
                    value={formData.twitter_creator || ''}
                    onChange={(e) => handleChange('twitter_creator', e.target.value)}
                    placeholder="@oru"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={formData.google_analytics_id || ''}
                    onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                  <Input
                    id="google_tag_manager_id"
                    value={formData.google_tag_manager_id || ''}
                    onChange={(e) => handleChange('google_tag_manager_id', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                <Input
                  id="facebook_pixel_id"
                  value={formData.facebook_pixel_id || ''}
                  onChange={(e) => handleChange('facebook_pixel_id', e.target.value)}
                  placeholder="123456789012345"
                />
              </div>
            </TabsContent>


            {/* Email Tab */}
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Service Provider</h3>
                <div className="space-y-2">
                  <Label htmlFor="email_provider">Provider</Label>
                  <Select
                    value={formData.email_provider || 'smtp'}
                    onValueChange={(value) => handleChange('email_provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select email provider" />
                    </SelectTrigger>
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
                      <Input
                        id="smtp_host"
                        value={formData.smtp_host || ''}
                        onChange={(e) => handleChange('smtp_host', e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={formData.smtp_port || 587}
                        onChange={(e) => handleChange('smtp_port', parseInt(e.target.value) || 587)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_user">SMTP User</Label>
                      <Input
                        id="smtp_user"
                        value={formData.smtp_user || ''}
                        onChange={(e) => handleChange('smtp_user', e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">SMTP Password</Label>
                      <Input
                        id="smtp_password"
                        type="password"
                        value={formData.smtp_password || ''}
                        onChange={(e) => handleChange('smtp_password', e.target.value)}
                        placeholder={formData.smtp_password === '***' ? '••••••••' : 'Enter password'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_from">From Email</Label>
                      <Input
                        id="smtp_from"
                        value={formData.smtp_from || ''}
                        onChange={(e) => handleChange('smtp_from', e.target.value)}
                        placeholder="noreply@example.com"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="smtp_secure"
                        checked={formData.smtp_secure || false}
                        onCheckedChange={(checked) => handleChange('smtp_secure', checked)}
                      />
                      <Label htmlFor="smtp_secure">Use SSL/TLS</Label>
                    </div>
                  </div>
                )}

                {formData.email_provider === 'sendgrid' && (
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="space-y-2">
                      <Label htmlFor="sendgrid_api_key">SendGrid API Key</Label>
                      <Input
                        id="sendgrid_api_key"
                        type="password"
                        value={formData.sendgrid_api_key || ''}
                        onChange={(e) => handleChange('sendgrid_api_key', e.target.value)}
                        placeholder={formData.sendgrid_api_key === '***' ? '••••••••' : 'Enter API Key'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sendgrid_from">From Email</Label>
                      <Input
                        id="sendgrid_from"
                        value={formData.sendgrid_from || ''}
                        onChange={(e) => handleChange('sendgrid_from', e.target.value)}
                        placeholder="noreply@example.com"
                      />
                    </div>
                  </div>
                )}

                {formData.email_provider === 'mailgun' && (
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="space-y-2">
                      <Label htmlFor="mailgun_api_key">Mailgun API Key</Label>
                      <Input
                        id="mailgun_api_key"
                        type="password"
                        value={formData.mailgun_api_key || ''}
                        onChange={(e) => handleChange('mailgun_api_key', e.target.value)}
                        placeholder={formData.mailgun_api_key === '***' ? '••••••••' : 'Enter API Key'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mailgun_domain">Mailgun Domain</Label>
                      <Input
                        id="mailgun_domain"
                        value={formData.mailgun_domain || ''}
                        onChange={(e) => handleChange('mailgun_domain', e.target.value)}
                        placeholder="mg.example.com"
                      />
                    </div>
                  </div>
                )}

                {formData.email_provider === 'aws_ses' && (
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aws_ses_region">AWS Region</Label>
                        <Input
                          id="aws_ses_region"
                          value={formData.aws_ses_region || ''}
                          onChange={(e) => handleChange('aws_ses_region', e.target.value)}
                          placeholder="us-east-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws_access_key_id">Access Key ID</Label>
                        <Input
                          id="aws_access_key_id"
                          value={formData.aws_access_key_id || ''}
                          onChange={(e) => handleChange('aws_access_key_id', e.target.value)}
                          placeholder={formData.aws_access_key_id === '***' ? '••••••••' : 'Enter Access Key'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws_secret_access_key">Secret Access Key</Label>
                        <Input
                          id="aws_secret_access_key"
                          type="password"
                          value={formData.aws_secret_access_key || ''}
                          onChange={(e) => handleChange('aws_secret_access_key', e.target.value)}
                          placeholder={formData.aws_secret_access_key === '***' ? '••••••••' : 'Enter Secret Key'}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.email_provider === 'resend' && (
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="space-y-2">
                      <Label htmlFor="resend_api_key">Resend API Key</Label>
                      <Input
                        id="resend_api_key"
                        type="password"
                        value={formData.resend_api_key || ''}
                        onChange={(e) => handleChange('resend_api_key', e.target.value)}
                        placeholder={formData.resend_api_key === '***' ? '••••••••' : 'Enter API Key'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resend_from">From Email</Label>
                      <Input
                        id="resend_from"
                        value={formData.resend_from || ''}
                        onChange={(e) => handleChange('resend_from', e.target.value)}
                        placeholder="onboarding@resend.dev"
                      />
                    </div>
                  </div>
                )}

                {formData.email_provider === 'postmark' && (
                  <div className="space-y-4 border rounded-md p-4">
                    {/* Add postmark fields if needed */}
                    <p className="text-sm text-muted-foreground">Postmark configuration not yet fully implemented in UI.</p>
                  </div>
                )}

              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <h3 className="text-lg font-semibold">Password Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Minimum Length</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    value={formData.password_min_length ?? 8}
                    onChange={(e) => handleChange('password_min_length', parseInt(e.target.value, 10) || 8)}
                    min={6}
                    max={128}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_expiry_days">Expiry (days, 0 = never)</Label>
                  <Input
                    id="password_expiry_days"
                    type="number"
                    value={formData.password_expiry_days ?? 90}
                    onChange={(e) => handleChange('password_expiry_days', parseInt(e.target.value, 10) ?? 90)}
                    min={0}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password_require_uppercase" className="cursor-pointer">Require uppercase</Label>
                  <Switch
                    id="password_require_uppercase"
                    checked={formData.password_require_uppercase ?? true}
                    onCheckedChange={(c) => handleChange('password_require_uppercase', c)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password_require_lowercase" className="cursor-pointer">Require lowercase</Label>
                  <Switch
                    id="password_require_lowercase"
                    checked={formData.password_require_lowercase ?? true}
                    onCheckedChange={(c) => handleChange('password_require_lowercase', c)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password_require_numbers" className="cursor-pointer">Require numbers</Label>
                  <Switch
                    id="password_require_numbers"
                    checked={formData.password_require_numbers ?? true}
                    onCheckedChange={(c) => handleChange('password_require_numbers', c)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password_require_symbols" className="cursor-pointer">Require symbols</Label>
                  <Switch
                    id="password_require_symbols"
                    checked={formData.password_require_symbols || false}
                    onCheckedChange={(c) => handleChange('password_require_symbols', c)}
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold pt-4">Session & Login</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout_minutes">Session timeout (minutes)</Label>
                  <Input
                    id="session_timeout_minutes"
                    type="number"
                    value={formData.session_timeout_minutes ?? 60}
                    onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value, 10) || 60)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max login attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={formData.max_login_attempts ?? 5}
                    onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value, 10) || 5)}
                    min={1}
                    max={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout_duration_minutes">Lockout duration (minutes)</Label>
                  <Input
                    id="lockout_duration_minutes"
                    type="number"
                    value={formData.lockout_duration_minutes ?? 30}
                    onChange={(e) => handleChange('lockout_duration_minutes', parseInt(e.target.value, 10) || 30)}
                    min={1}
                  />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="require_email_verification" className="cursor-pointer">Require email verification</Label>
                  <Switch
                    id="require_email_verification"
                    checked={formData.require_email_verification ?? true}
                    onCheckedChange={(c) => handleChange('require_email_verification', c)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_two_factor" className="cursor-pointer">Enable two-factor auth</Label>
                  <Switch
                    id="enable_two_factor"
                    checked={formData.enable_two_factor || false}
                    onCheckedChange={(c) => handleChange('enable_two_factor', c)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_captcha" className="cursor-pointer">Enable CAPTCHA</Label>
                  <Switch
                    id="enable_captcha"
                    checked={formData.enable_captcha || false}
                    onCheckedChange={(c) => handleChange('enable_captcha', c)}
                  />
                </div>
                {formData.enable_captcha && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="captcha_site_key">CAPTCHA site key</Label>
                      <Input
                        id="captcha_site_key"
                        value={formData.captcha_site_key || ''}
                        onChange={(e) => handleChange('captcha_site_key', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="captcha_secret_key">CAPTCHA secret key</Label>
                      <Input
                        id="captcha_secret_key"
                        type="password"
                        value={formData.captcha_secret_key === '***' ? '' : (formData.captcha_secret_key || '')}
                        onChange={(e) => handleChange('captcha_secret_key', e.target.value)}
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_rate_limiting" className="cursor-pointer">Enable rate limiting</Label>
                  <Switch
                    id="enable_rate_limiting"
                    checked={formData.enable_rate_limiting ?? true}
                    onCheckedChange={(c) => handleChange('enable_rate_limiting', c)}
                  />
                </div>
                {formData.enable_rate_limiting && (
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_requests_per_minute">Requests per minute</Label>
                    <Input
                      id="rate_limit_requests_per_minute"
                      type="number"
                      value={formData.rate_limit_requests_per_minute ?? 60}
                      onChange={(e) => handleChange('rate_limit_requests_per_minute', parseInt(e.target.value, 10) || 60)}
                      min={1}
                      max={10000}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Storage Tab */}
            <TabsContent value="storage" className="space-y-4">

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">File Storage Provider</h3>
                <div className="space-y-2">
                  <Label htmlFor="file_storage_provider">Provider</Label>
                  <Select
                    value={formData.file_storage_provider || 'local'}
                    onValueChange={(value) => handleChange('file_storage_provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Filesystem</SelectItem>
                      <SelectItem value="aws_s3">AWS S3</SelectItem>
                      <SelectItem value="r2">Cloudflare R2</SelectItem>
                      <SelectItem value="minio">MinIO (S3 Compatible)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.file_storage_provider === 'local' && (
                  <div className="space-y-2 border rounded-md p-4">
                    <Label htmlFor="file_storage_path">Storage Path</Label>
                    <Input
                      id="file_storage_path"
                      value={formData.file_storage_path || '/app/storage'}
                      onChange={(e) => handleChange('file_storage_path', e.target.value)}
                      placeholder="/app/storage"
                    />
                    <p className="text-xs text-muted-foreground">Absolute path on the server filesystem.</p>
                  </div>
                )}

                {(formData.file_storage_provider === 'aws_s3' || formData.file_storage_provider === 'r2' || formData.file_storage_provider === 'minio') && (
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aws_s3_bucket">Bucket Name</Label>
                        <Input
                          id="aws_s3_bucket"
                          value={formData.aws_s3_bucket || ''}
                          onChange={(e) => handleChange('aws_s3_bucket', e.target.value)}
                          placeholder="my-bucket"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws_s3_region">Region</Label>
                        <Input
                          id="aws_s3_region"
                          value={formData.aws_s3_region || 'auto'}
                          onChange={(e) => handleChange('aws_s3_region', e.target.value)}
                          placeholder="us-east-1 or auto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws_s3_access_key_id">Access Key ID</Label>
                        <Input
                          id="aws_s3_access_key_id"
                          value={formData.aws_s3_access_key_id || ''}
                          onChange={(e) => handleChange('aws_s3_access_key_id', e.target.value)}
                          placeholder={formData.aws_s3_access_key_id === '***' ? '••••••••' : 'Enter Access Key'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws_s3_secret_access_key">Secret Access Key</Label>
                        <Input
                          id="aws_s3_secret_access_key"
                          type="password"
                          value={formData.aws_s3_secret_access_key || ''}
                          onChange={(e) => handleChange('aws_s3_secret_access_key', e.target.value)}
                          placeholder={formData.aws_s3_secret_access_key === '***' ? '••••••••' : 'Enter Secret Key'}
                        />
                      </div>
                      {(formData.file_storage_provider === 'r2' || formData.file_storage_provider === 'minio') && (
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="aws_s3_endpoint">Custom Endpoint URL</Label>
                          <Input
                            id="aws_s3_endpoint"
                            // Note: The frontend interface might not have aws_s3_endpoint mapped yet, assuming public_url for now or need to add it
                            // Using custom_settings or similar if schema doesn't support it directly yet?
                            // Checking schema: logic used `process.env.AWS_S3_ENDPOINT`.
                            // We haven't added `aws_s3_endpoint` to DB schema.
                            // For now, let's omit or just show a warning that endpoint must be set via ENV or add to DB later.
                            // Wait, I can use `aws_s3_public_url` as a proxy for endpoint in some contexts? No.
                            // Let's rely on standard S3 config for now and assume AWS or auto-region for R2.
                            disabled
                            placeholder="To configure custom endpoints (R2/MinIO), please use ENV variables for now."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed_file_types">Allowed file types</Label>
                <Input
                  id="allowed_file_types"
                  value={formData.allowed_file_types || 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip'}
                  onChange={(e) => handleChange('allowed_file_types', e.target.value)}
                  placeholder="jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip"
                />
                <p className="text-sm text-muted-foreground">Extensions separated by comma</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_file_size_mb">Max Upload Size (MB)</Label>
                <Input
                  id="max_file_size_mb"
                  type="number"
                  value={formData.max_file_size_mb ?? 10}
                  onChange={(e) => handleChange('max_file_size_mb', parseInt(e.target.value, 10) || 10)}
                  min={1}
                  max={100}
                />
                <p className="text-sm text-muted-foreground">Server validation limit</p>
              </div>
            </TabsContent>


            {/* Other Settings Tab */}
            <TabsContent value="other" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="support_email">Support Email</Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={formData.support_email || ''}
                      onChange={(e) => handleChange('support_email', e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support_phone">Support Phone</Label>
                    <Input
                      id="support_phone"
                      value={formData.support_phone || ''}
                      onChange={(e) => handleChange('support_phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_address">Support Address</Label>
                  <Textarea
                    id="support_address"
                    value={formData.support_address || ''}
                    onChange={(e) => handleChange('support_address', e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      value={formData.facebook_url || ''}
                      onChange={(e) => handleChange('facebook_url', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_url">Twitter URL</Label>
                    <Input
                      id="twitter_url"
                      value={formData.twitter_url || ''}
                      onChange={(e) => handleChange('twitter_url', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      value={formData.linkedin_url || ''}
                      onChange={(e) => handleChange('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      value={formData.instagram_url || ''}
                      onChange={(e) => handleChange('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube_url">YouTube URL</Label>
                    <Input
                      id="youtube_url"
                      value={formData.youtube_url || ''}
                      onChange={(e) => handleChange('youtube_url', e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Legal & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="terms_of_service_url">Terms of Service URL</Label>
                    <Input
                      id="terms_of_service_url"
                      value={formData.terms_of_service_url || ''}
                      onChange={(e) => handleChange('terms_of_service_url', e.target.value)}
                      placeholder="https://example.com/terms"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
                    <Input
                      id="privacy_policy_url"
                      value={formData.privacy_policy_url || ''}
                      onChange={(e) => handleChange('privacy_policy_url', e.target.value)}
                      placeholder="https://example.com/privacy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cookie_policy_url">Cookie Policy URL</Label>
                    <Input
                      id="cookie_policy_url"
                      value={formData.cookie_policy_url || ''}
                      onChange={(e) => handleChange('cookie_policy_url', e.target.value)}
                      placeholder="https://example.com/cookies"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Maintenance Mode</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance_mode">Enable Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show maintenance message to all users
                    </p>
                  </div>
                  <Switch
                    id="maintenance_mode"
                    checked={formData.maintenance_mode || false}
                    onCheckedChange={(checked) => handleChange('maintenance_mode', checked)}
                  />
                </div>
                {formData.maintenance_mode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance_message"
                      value={formData.maintenance_message || ''}
                      onChange={(e) => handleChange('maintenance_message', e.target.value)}
                      placeholder="We're currently performing scheduled maintenance. Please check back soon."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Logging & Monitoring */}
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
                    onChange={(e) => handleChange('log_level', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <Input
                      id="log_retention_days"
                      type="number"
                      value={formData.log_retention_days || 30}
                      onChange={(e) => handleChange('log_retention_days', parseInt(e.target.value) || 30)}
                      min="1"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable_audit_logging" className="cursor-pointer">
                      Enable Audit Logging
                    </Label>
                    <Switch
                      id="enable_audit_logging"
                      checked={formData.enable_audit_logging ?? true}
                      onCheckedChange={(checked) => handleChange('enable_audit_logging', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable_error_tracking" className="cursor-pointer">
                      Enable Error Tracking (Sentry)
                    </Label>
                    <Switch
                      id="enable_error_tracking"
                      checked={formData.enable_error_tracking || false}
                      onCheckedChange={(checked) => handleChange('enable_error_tracking', checked)}
                    />
                  </div>
                  {formData.enable_error_tracking && (
                    <div className="space-y-2">
                      <Label htmlFor="sentry_dsn">Sentry DSN</Label>
                      <Input
                        id="sentry_dsn"
                        type="password"
                        value={formData.sentry_dsn || ''}
                        onChange={(e) => handleChange('sentry_dsn', e.target.value)}
                        placeholder="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable_performance_monitoring" className="cursor-pointer">
                      Enable Performance Monitoring
                    </Label>
                    <Switch
                      id="enable_performance_monitoring"
                      checked={formData.enable_performance_monitoring || false}
                      onCheckedChange={(checked) => handleChange('enable_performance_monitoring', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Backup Settings */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Backup Configuration
                </h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_auto_backup" className="cursor-pointer">
                    Enable Automatic Backups
                  </Label>
                  <Switch
                    id="enable_auto_backup"
                    checked={formData.enable_auto_backup ?? true}
                    onCheckedChange={(checked) => handleChange('enable_auto_backup', checked)}
                  />
                </div>
                {formData.enable_auto_backup && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backup_frequency_hours">Backup Frequency (Hours)</Label>
                      <Input
                        id="backup_frequency_hours"
                        type="number"
                        value={formData.backup_frequency_hours || 24}
                        onChange={(e) => handleChange('backup_frequency_hours', parseInt(e.target.value) || 24)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup_retention_days">Backup Retention (Days)</Label>
                      <Input
                        id="backup_retention_days"
                        type="number"
                        value={formData.backup_retention_days || 7}
                        onChange={(e) => handleChange('backup_retention_days', parseInt(e.target.value) || 7)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="backup_storage_path">Backup Storage Path</Label>
                      <Input
                        id="backup_storage_path"
                        value={formData.backup_storage_path || '/app/backups'}
                        onChange={(e) => handleChange('backup_storage_path', e.target.value)}
                        placeholder="/app/backups"
                      />
                    </div>
                  </div>
                )}
              </div>

            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

