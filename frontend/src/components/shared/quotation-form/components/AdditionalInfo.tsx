import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Quotation } from '../types';

interface AdditionalInfoProps {
  formData: Quotation;
  setFormData: (updater: (prev: Quotation) => Quotation) => void;
}

export function AdditionalInfo({ formData, setFormData }: AdditionalInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terms_conditions">Terms &amp; Conditions</Label>
          <Textarea
            id="terms_conditions"
            value={formData.terms_conditions}
            onChange={e => setFormData(prev => ({ ...prev, terms_conditions: e.target.value }))}
            placeholder="Enter payment terms, delivery conditions, etc."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">Standard terms and conditions for this quotation</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Internal notes (not visible to client)..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">Private notes for your reference only</p>
        </div>
      </CardContent>
    </Card>
  );
}
