import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Copy, Trash2, Calculator } from 'lucide-react';
import type { QuotationLineItem } from './types';

interface QuotationLineItemsTableProps {
  lineItems: QuotationLineItem[];
  onLineItemChange: (itemId: string, field: keyof QuotationLineItem, value: unknown) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (itemId: string) => void;
  onDuplicateLineItem: (itemId: string) => void;
  onTyping: () => void;
  formatCurrency: (amount: number) => string;
  calculateLineTotal: (item: QuotationLineItem) => number;
  subtotal: number;
}

export const QuotationLineItemsTable = ({
  lineItems,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
  onDuplicateLineItem,
  onTyping,
  formatCurrency,
  calculateLineTotal,
  subtotal
}: QuotationLineItemsTableProps) => {
  const validItemsCount = lineItems.filter((item) => item.item_name && item.item_name.trim()).length;

  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl">Line Items</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Add products or services to your quotation. At least one item is required.
            </p>
          </div>
          <Button type="button" variant="default" size="sm" onClick={onAddLineItem} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b sticky top-0 z-10">
              <tr>
                <th className="text-left p-4 font-semibold text-sm w-[25%]">Item Name *</th>
                <th className="text-left p-4 font-semibold text-sm w-[20%]">Description</th>
                <th className="text-center p-4 font-semibold text-sm w-[10%]">Qty</th>
                <th className="text-right p-4 font-semibold text-sm w-[12%]">Unit Price (₹)</th>
                <th className="text-center p-4 font-semibold text-sm w-[10%]">Disc. %</th>
                <th className="text-right p-4 font-semibold text-sm w-[13%]">Line Total (₹)</th>
                <th className="text-center p-4 font-semibold text-sm w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <Input
                      value={item.item_name}
                      onChange={(e) => {
                        onTyping();
                        onLineItemChange(item.id, 'item_name', e.target.value);
                      }}
                      placeholder="Enter item name"
                      className="border-0 focus-visible:ring-2"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      value={item.description || ''}
                      onChange={(e) => {
                        onTyping();
                        onLineItemChange(item.id, 'description', e.target.value);
                      }}
                      placeholder="Optional description"
                      className="border-0 focus-visible:ring-2"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.quantity === 0 && typeof item.quantity === 'number' ? '' : item.quantity}
                      onChange={(e) => onLineItemChange(item.id, 'quantity', e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        onLineItemChange(item.id, 'quantity', val);
                      }}
                      className="text-center border-0 focus-visible:ring-2 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="1"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-muted-foreground text-sm">₹</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unit_price === 0 && typeof item.unit_price === 'number' ? '' : item.unit_price}
                        onChange={(e) => onLineItemChange(item.id, 'unit_price', e.target.value)}
                        onBlur={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          onLineItemChange(item.id, 'unit_price', val);
                        }}
                        className="text-right border-0 focus-visible:ring-2 w-full min-w-[100px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={
                        (item.discount_percentage === 0 || !item.discount_percentage) &&
                        typeof item.discount_percentage !== 'string'
                          ? ''
                          : item.discount_percentage
                      }
                      onChange={(e) => onLineItemChange(item.id, 'discount_percentage', e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        onLineItemChange(item.id, 'discount_percentage', val);
                      }}
                      className="text-center border-0 focus-visible:ring-2 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-muted-foreground text-sm">₹</span>
                      <div className="text-right bg-muted px-3 py-2 rounded-md font-semibold min-w-[100px] text-foreground">
                        {formatCurrency(calculateLineTotal(item))}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicateLineItem(item.id)}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        title="Duplicate item"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4 p-4">
          {lineItems.map((item) => (
            <Card key={item.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Input
                      value={item.item_name}
                      onChange={(e) => onLineItemChange(item.id, 'item_name', e.target.value)}
                      placeholder="Item name *"
                      className="font-medium text-base border-0 focus-visible:ring-2 p-0 h-auto"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicateLineItem(item.id)}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      title="Duplicate item"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                  <Input
                    value={item.description || ''}
                    onChange={(e) => onLineItemChange(item.id, 'description', e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Quantity</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.quantity === 0 && typeof item.quantity === 'number' ? '' : item.quantity}
                      onChange={(e) => onLineItemChange(item.id, 'quantity', e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        onLineItemChange(item.id, 'quantity', val);
                      }}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Unit Price (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unit_price === 0 && typeof item.unit_price === 'number' ? '' : item.unit_price}
                      onChange={(e) => onLineItemChange(item.id, 'unit_price', e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        onLineItemChange(item.id, 'unit_price', val);
                      }}
                      placeholder="0.00"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Discount (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={
                        (item.discount_percentage === 0 || !item.discount_percentage) &&
                        typeof item.discount_percentage !== 'string'
                          ? ''
                          : item.discount_percentage
                      }
                      onChange={(e) => onLineItemChange(item.id, 'discount_percentage', e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        onLineItemChange(item.id, 'discount_percentage', val);
                      }}
                      placeholder="0"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Line Total (₹)</Label>
                    <div className="bg-muted px-3 py-2 rounded-md font-semibold text-center">
                      {formatCurrency(calculateLineTotal(item))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lineItems.length > 0 && (
          <div className="border-t bg-muted/50 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{validItemsCount}</span> valid item(s)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Subtotal</span>
                  <span className="font-bold text-xl">₹{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {lineItems.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No items added yet</p>
            <Button type="button" variant="outline" onClick={onAddLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
