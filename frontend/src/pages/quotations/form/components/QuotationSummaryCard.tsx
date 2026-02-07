import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Quotation } from './types';

interface QuotationSummaryCardProps {
  formData: Quotation;
  onFormDataChange: (updates: Partial<Quotation>) => void;
  onTyping: () => void;
}

export const QuotationSummaryCard = ({
  formData,
  onFormDataChange,
  onTyping
}: QuotationSummaryCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Pricing & Totals</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax_rate">Tax Rate (%)</Label>
          <Input
            id="tax_rate"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={formData.tax_rate}
            onChange={(e) => {
              onTyping();
              onFormDataChange({ tax_rate: Number(e.target.value) || 0 });
            }}
            placeholder="18"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <p className="text-xs text-muted-foreground">Tax percentage to apply</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Overall Discount (₹)</Label>
          <Input
            id="discount"
            type="number"
            min={0}
            step={0.01}
            value={formData.discount === 0 ? '' : (formData.discount || '')}
            onChange={(e) => {
              onTyping();
              onFormDataChange({ discount: e.target.value === '' ? '' : Number(e.target.value) });
            }}
            onBlur={(e) => {
              onFormDataChange({ discount: e.target.value === '' ? 0 : Number(e.target.value) || 0 });
            }}
            placeholder="0.00"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <p className="text-xs text-muted-foreground">Total discount amount (applied before tax)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
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
