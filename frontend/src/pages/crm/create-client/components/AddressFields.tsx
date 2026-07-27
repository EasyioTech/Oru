import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import type { ClientFormData } from '../types';

interface Props {
  formData: ClientFormData;
  onChange: (field: keyof ClientFormData, value: string) => void;
}

export function AddressFields({ formData, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Information
        </CardTitle>
        <CardDescription>Physical location and mailing address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input id="address" value={formData.address} onChange={e => onChange('address', e.target.value)} placeholder="123 Main Street" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={formData.city} onChange={e => onChange('city', e.target.value)} placeholder="City" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input id="state" value={formData.state} onChange={e => onChange('state', e.target.value)} placeholder="State or Province" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal/ZIP Code</Label>
            <Input id="postal_code" value={formData.postal_code} onChange={e => onChange('postal_code', e.target.value)} placeholder="12345" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={formData.country} onChange={e => onChange('country', e.target.value)} placeholder="Country" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
