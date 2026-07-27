import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import type { ClientFormData } from '../types';

interface Props {
  formData: ClientFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ClientFormData, value: string) => void;
}

export function ContactPersonFields({ formData, errors, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Contact Person Information
        </CardTitle>
        <CardDescription>Primary contact details for this client</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person Name</Label>
            <Input id="contact_person" value={formData.contact_person} onChange={e => onChange('contact_person', e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_position">Position/Title</Label>
            <Input id="contact_position" value={formData.contact_position} onChange={e => onChange('contact_position', e.target.value)} placeholder="e.g., CEO, Manager" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" type="email" value={formData.contact_email} onChange={e => onChange('contact_email', e.target.value)} placeholder="contact@example.com" className={errors.contact_email ? 'border-destructive' : ''} />
            {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input id="contact_phone" value={formData.contact_phone} onChange={e => onChange('contact_phone', e.target.value)} placeholder="+1 (555) 123-4567" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
