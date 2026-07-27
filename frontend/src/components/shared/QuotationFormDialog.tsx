import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuotationForm } from './quotation-form/useQuotationForm';
import { TemplateSelector } from './quotation-form/components/TemplateSelector';
import { BasicInfoFields } from './quotation-form/components/BasicInfoFields';
import { LineItemsEditor } from './quotation-form/components/LineItemsEditor';
import { PricingTotals } from './quotation-form/components/PricingTotals';
import { AdditionalInfo } from './quotation-form/components/AdditionalInfo';
import type { QuotationFormDialogProps } from './quotation-form/types';

const QuotationFormDialog: React.FC<QuotationFormDialogProps> = ({ isOpen, onClose, quotation, onQuotationSaved }) => {
  const ctx = useQuotationForm(isOpen, quotation, onClose, onQuotationSaved);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quotation?.id ? 'Edit Quotation' : 'Create New Quotation'}</DialogTitle>
          <DialogDescription>
            {quotation?.id ? 'Update quotation details' : 'Create a new quotation for your client'}
            {ctx.lastSaved && (
              <span className="ml-2 text-xs text-muted-foreground">
                Draft saved {ctx.lastSaved.toLocaleTimeString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={ctx.handleSubmit} className="space-y-6">
          <TemplateSelector
            templates={ctx.templates}
            templateId={ctx.formData.template_id}
            onSelect={ctx.applyTemplate}
          />

          <BasicInfoFields
            formData={ctx.formData}
            setFormData={ctx.setFormData}
            clients={ctx.clients}
            loadingClients={ctx.loadingClients}
          />

          <LineItemsEditor
            lineItems={ctx.lineItems}
            onAdd={ctx.addLineItem}
            onRemove={ctx.removeLineItem}
            onChange={ctx.handleLineItemChange}
            calculateLineTotal={ctx.calculateLineTotal}
          />

          <PricingTotals
            formData={ctx.formData}
            setFormData={ctx.setFormData}
          />

          <AdditionalInfo
            formData={ctx.formData}
            setFormData={ctx.setFormData}
          />

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={ctx.saveDraft}
                disabled={ctx.savingDraft || !ctx.formData.title.trim() || !ctx.formData.client_id}
              >
                {ctx.savingDraft ? 'Saving Draft...' : 'Save Draft'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={ctx.loading}>
                {ctx.loading ? 'Saving...' : quotation?.id ? 'Update Quotation' : 'Create Quotation'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationFormDialog;
