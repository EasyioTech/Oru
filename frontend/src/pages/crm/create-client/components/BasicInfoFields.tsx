import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import type { ClientFormData } from '../types';

interface Props {
  formData: ClientFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ClientFormData, value: string) => void;
}

export function BasicInfoFields({ formData, errors, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>Essential details about the client</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Client Name <span className="text-destructive">*</span></Label>
          <Input id="name" value={formData.name} onChange={e => onChange('name', e.target.value)} placeholder="Enter client name" className={errors.name ? 'border-destructive' : ''} />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" value={formData.company_name} onChange={e => onChange('company_name', e.target.value)} placeholder="Company name (if different)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={formData.industry} onChange={e => onChange('industry', e.target.value)} placeholder="e.g., Technology, Healthcare" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={formData.email} onChange={e => onChange('email', e.target.value)} placeholder="client@example.com" className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={formData.phone} onChange={e => onChange('phone', e.target.value)} placeholder="+1 (555) 123-4567" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={formData.website} onChange={e => onChange('website', e.target.value)} placeholder="https://www.example.com" className={errors.website ? 'border-destructive' : ''} />
            {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={v => onChange('status', v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
