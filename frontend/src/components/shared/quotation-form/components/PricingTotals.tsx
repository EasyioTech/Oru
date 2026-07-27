import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Quotation } from '../types';

interface PricingTotalsProps {
  formData: Quotation;
  setFormData: (updater: (prev: Quotation) => Quotation) => void;
}

export function PricingTotals({ formData, setFormData }: PricingTotalsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing &amp; Totals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
            <Input
              id="tax_rate" type="number" min="0" max="100" step="0.01"
              value={formData.tax_rate}
              onChange={e => setFormData(prev => ({ ...prev, tax_rate: Number(e.target.value) }))}
              placeholder="18"
            />
            <p className="text-xs text-muted-foreground">Tax percentage to apply</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Overall Discount (₹)</Label>
            <Input
              id="discount" type="number" min="0" step="0.01"
              value={formData.discount || 0}
              onChange={e => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">Total discount amount (applied before tax)</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <Label className="text-sm text-muted-foreground">Subtotal</Label>
            <p className="text-lg font-semibold">₹{(Number(formData.subtotal) || 0).toFixed(2)}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Discount</Label>
            <p className="text-lg font-semibold text-red-600">-₹{(Number(formData.discount) || 0).toFixed(2)}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Tax ({Number(formData.tax_rate) || 0}%)</Label>
            <p className="text-lg font-semibold">₹{(Number(formData.tax_amount) || 0).toFixed(2)}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Total Amount</Label>
            <p className="text-2xl font-bold">₹{(Number(formData.total_amount) || 0).toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
