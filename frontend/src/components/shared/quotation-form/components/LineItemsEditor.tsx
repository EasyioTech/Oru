import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { QuotationLineItem } from '../types';

interface LineItemsEditorProps {
  lineItems: QuotationLineItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof QuotationLineItem, value: unknown) => void;
  calculateLineTotal: (item: QuotationLineItem) => number;
}

export function LineItemsEditor({ lineItems, onAdd, onRemove, onChange, calculateLineTotal }: LineItemsEditorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Line Items</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lineItems.map(item => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
            <div className="col-span-4">
              <Label className="text-xs">Item Name *</Label>
              <Input value={item.item_name} onChange={e => onChange(item.id, 'item_name', e.target.value)} placeholder="Item name" />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Description</Label>
              <Input value={item.description || ''} onChange={e => onChange(item.id, 'description', e.target.value)} placeholder="Description" />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">Qty</Label>
              <Input
                type="number" min="0" step="0.01" value={item.quantity}
                onChange={e => onChange(item.id, 'quantity', Number(e.target.value))}
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">Unit Price</Label>
              <Input
                type="number" min="0" step="0.01" value={item.unit_price}
                onChange={e => onChange(item.id, 'unit_price', Number(e.target.value))}
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">Disc. %</Label>
              <Input
                type="number" min="0" max="100" step="0.01"
                value={item.discount_percentage || 0}
                onChange={e => onChange(item.id, 'discount_percentage', Number(e.target.value))}
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">Total</Label>
              <Input value={calculateLineTotal(item).toFixed(2)} readOnly className="bg-muted" />
            </div>
            <div className="col-span-1">
              <Button
                type="button" variant="ghost" size="sm"
                onClick={() => onRemove(item.id)}
                disabled={lineItems.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
