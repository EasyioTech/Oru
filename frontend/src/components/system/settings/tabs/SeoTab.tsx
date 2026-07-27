import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type SystemSettings } from '@/services/api/system';

interface SeoTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function SeoTab({ formData, onChange }: SeoTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="meta_title">Meta Title</Label>
        <Input id="meta_title" value={formData.meta_title || ''} onChange={e => onChange('meta_title', e.target.value)} placeholder="Oru ERP - Complete Business Management" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meta_description">Meta Description</Label>
        <Textarea id="meta_description" value={formData.meta_description || ''} onChange={e => onChange('meta_description', e.target.value)} placeholder="A comprehensive ERP system for managing your business operations" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meta_keywords">Meta Keywords (comma-separated)</Label>
        <Input id="meta_keywords" value={formData.meta_keywords || ''} onChange={e => onChange('meta_keywords', e.target.value)} placeholder="ERP, business management, CRM, accounting" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="og_image_url">Open Graph Image URL</Label>
        <Input id="og_image_url" value={formData.og_image_url || ''} onChange={e => onChange('og_image_url', e.target.value)} placeholder="https://example.com/og-image.png" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="og_title">Open Graph Title</Label>
          <Input id="og_title" value={formData.og_title || ''} onChange={e => onChange('og_title', e.target.value)} placeholder="Oru ERP" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="og_description">Open Graph Description</Label>
          <Input id="og_description" value={formData.og_description || ''} onChange={e => onChange('og_description', e.target.value)} placeholder="Complete Business Management Solution" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="twitter_card_type">Twitter Card Type</Label>
          <Input id="twitter_card_type" value={formData.twitter_card_type || 'summary_large_image'} onChange={e => onChange('twitter_card_type', e.target.value)} placeholder="summary_large_image" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter_site">Twitter Site</Label>
          <Input id="twitter_site" value={formData.twitter_site || ''} onChange={e => onChange('twitter_site', e.target.value)} placeholder="@oru" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter_creator">Twitter Creator</Label>
          <Input id="twitter_creator" value={formData.twitter_creator || ''} onChange={e => onChange('twitter_creator', e.target.value)} placeholder="@oru" />
        </div>
      </div>
    </div>
  );
}
