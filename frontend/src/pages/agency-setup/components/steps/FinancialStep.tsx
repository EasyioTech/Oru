import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CreditCard, Receipt, Landmark } from 'lucide-react';
import { CURRENCIES } from '../../constants';
import type { AgencySetupFormData } from '../../types';

interface FinancialStepProps {
  formData: AgencySetupFormData;
  setFormData: React.Dispatch<React.SetStateAction<AgencySetupFormData>>;
}

export function FinancialStep({ formData, setFormData }: FinancialStepProps) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg md:text-xl font-semibold mb-1.5 flex items-center gap-2 text-slate-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-primary" />
          Financial Configuration
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure currency, billing, and financial settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <CreditCard className="h-4 w-4 text-primary" />
              Currency & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Base Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fiscal Year Start</Label>
                <Input
                  type="text"
                  placeholder="MM-DD (e.g., 01-01)"
                  value={formData.fiscalYearStart}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fiscalYearStart: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Default Payment Terms (Days)
                </Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                  className="h-11 md:h-11 text-base"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Invoice Prefix</Label>
                <Input
                  placeholder="INV"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData((prev) => ({ ...prev, invoicePrefix: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Receipt className="h-4 w-4 text-primary" />
              Tax Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.taxRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, taxRate: e.target.value }))}
                  className="h-11 md:h-11 text-base"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2 flex items-center gap-4">
                <div className="flex-1">
                  <Label>Enable GST/VAT</Label>
                  <p className="text-xs text-muted-foreground">Enable GST/VAT tracking</p>
                </div>
                <Switch
                  checked={formData.enableGST}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableGST: checked }))}
                />
              </div>

              {formData.enableGST && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">GST/VAT Number</Label>
                  <Input
                    placeholder="Enter GST/VAT number"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))}
                    className="h-11"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Landmark className="h-4 w-4 text-primary" />
              Bank Details (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Name</Label>
                <Input
                  placeholder="Account holder name"
                  value={formData.bankDetails.accountName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankDetails: { ...prev.bankDetails, accountName: e.target.value },
                    }))
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Number</Label>
                <Input
                  placeholder="Account number"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankDetails: { ...prev.bankDetails, accountNumber: e.target.value },
                    }))
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bank Name</Label>
                <Input
                  placeholder="Bank name"
                  value={formData.bankDetails.bankName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankDetails: { ...prev.bankDetails, bankName: e.target.value },
                    }))
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Routing/SWIFT Code</Label>
                <Input
                  placeholder="Routing or SWIFT code"
                  value={formData.bankDetails.routingNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankDetails: { ...prev.bankDetails, routingNumber: e.target.value },
                    }))
                  }
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
