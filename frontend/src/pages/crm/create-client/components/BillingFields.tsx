import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import type { ClientFormData } from '../types';

interface Props {
  formData: ClientFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ClientFormData, value: string) => void;
}

export function BillingFields({ formData, errors, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing Information
        </CardTitle>
        <CardDescription>Billing address and payment terms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="billing_address">Billing Street Address</Label>
          <Input id="billing_address" value={formData.billing_address} onChange={e => onChange('billing_address', e.target.value)} placeholder="Leave empty if same as address above" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billing_city">Billing City</Label>
            <Input id="billing_city" value={formData.billing_city} onChange={e => onChange('billing_city', e.target.value)} placeholder="Billing city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing_state">Billing State/Province</Label>
            <Input id="billing_state" value={formData.billing_state} onChange={e => onChange('billing_state', e.target.value)} placeholder="Billing state" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billing_postal_code">Billing Postal/ZIP Code</Label>
            <Input id="billing_postal_code" value={formData.billing_postal_code} onChange={e => onChange('billing_postal_code', e.target.value)} placeholder="Billing postal code" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing_country">Billing Country</Label>
            <Input id="billing_country" value={formData.billing_country} onChange={e => onChange('billing_country', e.target.value)} placeholder="Billing country" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
            <Input id="tax_id" value={formData.tax_id} onChange={e => onChange('tax_id', e.target.value)} placeholder="Tax identification number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
            <Input id="payment_terms" type="number" value={formData.payment_terms} onChange={e => onChange('payment_terms', e.target.value)} placeholder="30" min="0" className={errors.payment_terms ? 'border-destructive' : ''} />
            {errors.payment_terms && <p className="text-sm text-destructive">{errors.payment_terms}</p>}
            <p className="text-xs text-muted-foreground">Number of days until payment is due (e.g., 30 for Net 30)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
