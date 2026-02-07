import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/database';
import { generateUUID } from '@/lib/uuid';
import { useAuth } from '@/hooks/useAuth';
import { getAgencyId } from '@/utils/agencyUtils';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  QuotationHeaderForm,
  QuotationLineItemsTable,
  QuotationSummaryCard,
  type Quotation,
  type QuotationLineItem,
  type Client,
  type QuotationTemplate,
} from './components';

const QuotationForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuth();
  const user = auth?.user;
  const profile = auth?.profile;
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([]);
  const [formData, setFormData] = useState<Quotation>({
    client_id: '',
    title: '',
    description: '',
    status: 'draft',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    valid_until: '',
    subtotal: 0,
    tax_rate: 18,
    tax_amount: 0,
    discount: 0,
    total_amount: 0,
    terms_conditions: '',
    notes: '',
    template_id: null,
  });
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    return '';
  };

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  const calculateLineTotal = (item: QuotationLineItem): number => {
    const qty =
      typeof item.quantity === 'string'
        ? item.quantity === ''
          ? 0
          : parseFloat(item.quantity) || 0
        : Number(item.quantity) || 0;
    const price =
      typeof item.unit_price === 'string'
        ? item.unit_price === ''
          ? 0
          : parseFloat(item.unit_price) || 0
        : Number(item.unit_price) || 0;
    const discountPct =
      typeof item.discount_percentage === 'string'
        ? item.discount_percentage === ''
          ? 0
          : parseFloat(item.discount_percentage) || 0
        : Number(item.discount_percentage) || 0;
    const subtotal = qty * price;
    const discount = subtotal * (discountPct / 100);
    return Math.round((subtotal - discount) * 100) / 100;
  };

  const handleTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  }, []);

  useEffect(() => {
    const loadQuotation = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const agencyId = await getAgencyId(profile, user?.id);
        if (!agencyId) {
          toast({ title: 'Error', description: 'Agency ID not found', variant: 'destructive' });
          navigate('/quotations');
          return;
        }
        const { data: quotation, error } = await db
          .from('quotations')
          .select('*')
          .eq('id', id)
          .eq('agency_id', agencyId)
          .single();
        if (error) throw error;
        if (!quotation) {
          toast({ title: 'Error', description: 'Quotation not found', variant: 'destructive' });
          navigate('/quotations');
          return;
        }
        setFormData({
          client_id: quotation.client_id || '',
          title: quotation.title || '',
          description: quotation.description || '',
          status: quotation.status || 'draft',
          issue_date: formatDateForInput(quotation.issue_date),
          expiry_date: formatDateForInput(quotation.expiry_date),
          valid_until: formatDateForInput(quotation.valid_until),
          subtotal: Number(quotation.subtotal) || 0,
          tax_rate: Number(quotation.tax_rate) || 18,
          tax_amount: Number(quotation.tax_amount) || 0,
          discount: Number(quotation.discount) || 0,
          total_amount: Number(quotation.total_amount) || 0,
          terms_conditions: quotation.terms_conditions || quotation.terms_and_conditions || '',
          notes: quotation.notes || '',
          template_id: quotation.template_id || null,
        });
        const { data: items, error: itemsError } = await db
          .from('quotation_line_items')
          .select('*')
          .eq('quotation_id', id)
          .order('sort_order', { ascending: true });
        if (!itemsError && items && items.length > 0) {
          setLineItems(items);
        } else {
          setLineItems([
            {
              id: generateUUID(),
              item_name: '',
              description: '',
              quantity: 1,
              unit_price: 0,
              discount_percentage: 0,
              sort_order: 0,
            },
          ]);
        }
      } catch (error: unknown) {
        toast({
          title: 'Error',
          description: (error as Error).message || 'Failed to load quotation',
          variant: 'destructive',
        });
        navigate('/quotations');
      } finally {
        setLoading(false);
      }
    };
    loadQuotation();
  }, [id, profile, user, navigate, toast]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const agencyId = await getAgencyId(profile, user?.id);
        if (!agencyId) {
          setClients([]);
          return;
        }
        const { data, error } = await db
          .from('clients')
          .select('id, name, company_name')
          .eq('agency_id', agencyId)
          .eq('is_active', true)
          .order('name', { ascending: true });
        if (error) throw error;
        setClients(data || []);
      } catch (error: unknown) {
        toast({ title: 'Error', description: 'Failed to fetch clients', variant: 'destructive' });
      } finally {
        setLoadingClients(false);
      }
    };
    const fetchTemplates = async () => {
      try {
        const agencyId = await getAgencyId(profile, user?.id);
        if (!agencyId) {
          setTemplates([]);
          return;
        }
        const { data, error } = await db
          .from('quotation_templates')
          .select('id, name, description, template_data')
          .eq('is_active', true)
          .eq('agency_id', agencyId)
          .order('name', { ascending: true });
        if (error) throw error;
        setTemplates(data || []);
      } catch (error: unknown) {
        console.error('Error fetching templates:', error);
      }
    };
    fetchClients();
    fetchTemplates();
    if (!id) {
      setLineItems([
        {
          id: generateUUID(),
          item_name: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          discount_percentage: 0,
          sort_order: 0,
        },
      ]);
    }
  }, [id, profile, user, toast]);

  useEffect(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      if (item.item_name && item.item_name.trim()) {
        const qty =
          typeof item.quantity === 'string'
            ? item.quantity === ''
              ? 0
              : parseFloat(item.quantity) || 0
            : Number(item.quantity) || 0;
        const price =
          typeof item.unit_price === 'string'
            ? item.unit_price === ''
              ? 0
              : parseFloat(item.unit_price) || 0
            : Number(item.unit_price) || 0;
        const discountPct =
          typeof item.discount_percentage === 'string'
            ? item.discount_percentage === ''
              ? 0
              : parseFloat(item.discount_percentage) || 0
            : Number(item.discount_percentage) || 0;
        const itemSubtotal = qty * price;
        const itemDiscount = itemSubtotal * (discountPct / 100);
        return sum + (itemSubtotal - itemDiscount);
      }
      return sum;
    }, 0);
    const roundedSubtotal = Math.round(subtotal * 100) / 100;
    const discountAmount =
      typeof formData.discount === 'string' && formData.discount === ''
        ? 0
        : Number(formData.discount) || 0;
    const subtotalAfterDiscount = Math.max(0, roundedSubtotal - discountAmount);
    const taxRate = Number(formData.tax_rate) || 0;
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);
    const totalAmount = subtotalAfterDiscount + taxAmount;
    const roundedTaxAmount = Math.round(taxAmount * 100) / 100;
    const roundedTotalAmount = Math.round(totalAmount * 100) / 100;
    setFormData((prev) => {
      const prevSubtotal = Number(prev.subtotal) || 0;
      const prevTaxAmount = Number(prev.tax_amount) || 0;
      const prevTotalAmount = Number(prev.total_amount) || 0;
      if (
        Math.abs(prevSubtotal - roundedSubtotal) > 0.01 ||
        Math.abs(prevTaxAmount - roundedTaxAmount) > 0.01 ||
        Math.abs(prevTotalAmount - roundedTotalAmount) > 0.01
      ) {
        return {
          ...prev,
          subtotal: roundedSubtotal,
          tax_amount: roundedTaxAmount,
          total_amount: roundedTotalAmount,
        };
      }
      return prev;
    });
  }, [lineItems, formData.tax_rate, formData.discount]);

  const saveDraft = useCallback(
    async (silent = true) => {
      if (!formData.title.trim() || !formData.client_id || isTyping) return;
      try {
        setSavingDraft(true);
        const agencyId = await getAgencyId(profile, user?.id);
        if (!agencyId || !user?.id) return;
        const draftData = { ...formData, status: 'draft', agency_id: agencyId, created_by: user.id };
        const issueDate = formData.issue_date ? new Date(formData.issue_date).toISOString().split('T')[0] : null;
        const expiryDate = formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : null;
        const validUntil = formData.valid_until ? new Date(formData.valid_until).toISOString().split('T')[0] : null;

        if (id) {
          await db
            .from('quotations')
            .update({
              ...draftData,
              issue_date: issueDate,
              expiry_date: expiryDate,
              valid_until: validUntil,
              discount: formData.discount || 0,
            })
            .eq('id', id)
            .eq('agency_id', agencyId);
        } else {
          const quoteNumber = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
          const newDraft = {
            id: generateUUID(),
            quote_number: quoteNumber,
            quotation_number: quoteNumber,
            ...draftData,
            issue_date: issueDate,
            expiry_date: expiryDate,
            valid_until: validUntil,
            discount: formData.discount || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const { data: insertedDraft } = await db.from('quotations').insert([newDraft]).select().single();
          if (insertedDraft) navigate(`/quotations/${insertedDraft.id}`, { replace: true });
        }
        setLastSaved(new Date());
      } catch (error: unknown) {
        console.error('Error saving draft:', error);
      } finally {
        setSavingDraft(false);
      }
    },
    [formData, id, profile, user, navigate, isTyping]
  );

  useEffect(() => {
    if (!formData.title.trim() || !formData.client_id) return;
    if (!isTyping) {
      const saveTimeout = setTimeout(() => saveDraft(true), 2000);
      return () => clearTimeout(saveTimeout);
    }
  }, [isTyping, formData.title, formData.client_id, saveDraft]);

  useEffect(() => {
    if (!formData.title.trim() || !formData.client_id || isTyping) return;
    const autoSaveInterval = setInterval(() => saveDraft(true), 60000);
    return () => clearInterval(autoSaveInterval);
  }, [formData.title, formData.client_id, isTyping, saveDraft]);

  const handleLineItemChange = (itemId: string, field: keyof QuotationLineItem, value: unknown) => {
    handleTyping();
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        let processedValue = value;
        if (
          (field === 'quantity' || field === 'unit_price' || field === 'discount_percentage') &&
          value === ''
        ) {
          processedValue = '';
        } else if (field === 'quantity' || field === 'unit_price' || field === 'discount_percentage') {
          processedValue = Number(value) || 0;
        }
        const updated = { ...item, [field]: processedValue };
        return { ...updated, line_total: calculateLineTotal(updated) };
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: generateUUID(),
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount_percentage: 0,
        sort_order: prev.length,
      },
    ]);
  };

  const removeLineItem = (itemId: string) => {
    setLineItems((prev) => {
      const filtered = prev.filter((item) => item.id !== itemId);
      if (filtered.length === 0) {
        return [
          {
            id: generateUUID(),
            item_name: '',
            description: '',
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            sort_order: 0,
          },
        ];
      }
      return filtered.map((item, index) => ({ ...item, sort_order: index }));
    });
  };

  const duplicateLineItem = (itemId: string) => {
    const itemToDuplicate = lineItems.find((item) => item.id === itemId);
    if (itemToDuplicate) {
      setLineItems((prev) => [
        ...prev,
        {
          id: generateUUID(),
          item_name: itemToDuplicate.item_name,
          description: itemToDuplicate.description,
          quantity: itemToDuplicate.quantity,
          unit_price: itemToDuplicate.unit_price,
          discount_percentage: itemToDuplicate.discount_percentage || 0,
          sort_order: prev.length,
        },
      ]);
      toast({ title: 'Success', description: 'Item duplicated' });
    }
  };

  const useTemplate = async (templateId: string) => {
    try {
      const template = templates.find((t) => t.id === templateId);
      if (!template || !template.template_data) return;
      const content =
        typeof template.template_data === 'string'
          ? JSON.parse(template.template_data)
          : template.template_data;
      if (content.lineItems && Array.isArray(content.lineItems)) {
        setLineItems(
          content.lineItems.map((item: { item_name?: string; description?: string; quantity?: number; unit_price?: number; discount_percentage?: number }, index: number) => ({
            id: generateUUID(),
            item_name: item.item_name || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            discount_percentage: item.discount_percentage || 0,
            sort_order: index,
          }))
        );
      }
      if (content.terms_conditions) {
        setFormData((prev) => ({ ...prev, terms_conditions: content.terms_conditions }));
      }
      if (content.tax_rate) {
        setFormData((prev) => ({ ...prev, tax_rate: content.tax_rate }));
      }
      setFormData((prev) => ({ ...prev, template_id: templateId }));
      toast({ title: 'Success', description: 'Template applied successfully' });
    } catch (error: unknown) {
      toast({ title: 'Error', description: 'Failed to apply template', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: 'Error', description: 'Quotation title is required', variant: 'destructive' });
      return;
    }
    if (!formData.client_id) {
      toast({ title: 'Error', description: 'Please select a client', variant: 'destructive' });
      return;
    }
    const hasValidLineItems = lineItems.some((item) => item.item_name && item.item_name.trim());
    if (!hasValidLineItems) {
      toast({ title: 'Error', description: 'Please add at least one line item', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const validLineItems = lineItems.filter((item) => item.item_name && item.item_name.trim());
      const agencyId = await getAgencyId(profile, user?.id);
      if (!agencyId || !user?.id) {
        toast({
          title: 'Error',
          description: 'Agency ID or User ID not found. Please ensure you are logged in.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const issueDate = formData.issue_date ? new Date(formData.issue_date).toISOString().split('T')[0] : null;
      const expiryDate = formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : null;
      const validUntil = formData.valid_until ? new Date(formData.valid_until).toISOString().split('T')[0] : null;

      const toInsertLineItem = (item: QuotationLineItem, quotationId: string, index: number) => {
        const quantity =
          typeof item.quantity === 'string'
            ? item.quantity === ''
              ? 0
              : parseFloat(item.quantity) || 0
            : Number(item.quantity) || 0;
        const unitPrice =
          typeof item.unit_price === 'string'
            ? item.unit_price === ''
              ? 0
              : parseFloat(item.unit_price) || 0
            : Number(item.unit_price) || 0;
        const discountPct =
          typeof item.discount_percentage === 'string'
            ? item.discount_percentage === ''
              ? 0
              : parseFloat(item.discount_percentage) || 0
            : Number(item.discount_percentage) || 0;
        return {
          id: generateUUID(),
          quotation_id: quotationId,
          item_name: item.item_name.trim(),
          description: item.description?.trim() || null,
          quantity: Math.round(quantity * 100) / 100,
          unit_price: Math.round(unitPrice * 100) / 100,
          discount_percentage: Math.round(discountPct * 100) / 100,
          sort_order: index,
        };
      };

      if (id) {
        const { tax_amount, total_amount, ...updateData } = formData;
        await db
          .from('quotations')
          .update({
            ...updateData,
            issue_date: issueDate,
            expiry_date: expiryDate,
            valid_until: validUntil,
            discount: formData.discount || 0,
          })
          .eq('id', id)
          .eq('agency_id', agencyId);
        await db.from('quotation_line_items').delete().eq('quotation_id', id);
        const lineItemsToInsert = validLineItems.map((item, index) => toInsertLineItem(item, id, index));
        if (lineItemsToInsert.length > 0) {
          const { error: lineItemsError } = await db.from('quotation_line_items').insert(lineItemsToInsert);
          if (lineItemsError) throw lineItemsError;
        }
        toast({ title: 'Success', description: 'Quotation updated successfully' });
      } else {
        const { tax_amount, total_amount, ...quotationData } = formData;
        const quoteNumber = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        const newQuotation = {
          id: generateUUID(),
          quote_number: quoteNumber,
          quotation_number: quoteNumber,
          ...quotationData,
          issue_date: issueDate,
          expiry_date: expiryDate,
          valid_until: validUntil,
          discount: formData.discount || 0,
          created_by: user.id,
          agency_id: agencyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: insertedQuotation, error: insertError } = await db
          .from('quotations')
          .insert([newQuotation])
          .select()
          .single();
        if (insertError) throw insertError;
        if (validLineItems.length > 0 && insertedQuotation) {
          const lineItemsToInsert = validLineItems.map((item, index) =>
            toInsertLineItem(item, insertedQuotation.id, index)
          );
          const { error: lineItemsError } = await db.from('quotation_line_items').insert(lineItemsToInsert);
          if (lineItemsError) throw lineItemsError;
        }
        toast({ title: 'Success', description: 'Quotation created successfully' });
      }
      navigate('/quotations');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to save quotation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quotation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotations
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              {id ? 'Edit Quotation' : 'Create New Quotation'}
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {id
                ? 'Update quotation details below.'
                : 'Fill in the details to create a new quotation. Your work is automatically saved as draft.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savingDraft && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Saving...</span>
            </div>
          )}
          {lastSaved && !savingDraft && (
            <div className="text-xs text-muted-foreground">Auto-saved: {lastSaved.toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <QuotationHeaderForm
          formData={formData}
          onFormDataChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
          clients={clients}
          templates={templates}
          loadingClients={loadingClients}
          onTyping={handleTyping}
          onUseTemplate={useTemplate}
        />

        <QuotationLineItemsTable
          lineItems={lineItems}
          onLineItemChange={handleLineItemChange}
          onAddLineItem={addLineItem}
          onRemoveLineItem={removeLineItem}
          onDuplicateLineItem={duplicateLineItem}
          onTyping={handleTyping}
          formatCurrency={formatCurrency}
          calculateLineTotal={calculateLineTotal}
          subtotal={Number(formData.subtotal) || 0}
        />

        <QuotationSummaryCard
          formData={formData}
          onFormDataChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
          onTyping={handleTyping}
        />

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terms_conditions">Terms & Conditions</Label>
              <Textarea
                id="terms_conditions"
                value={formData.terms_conditions}
                onChange={(e) => {
                  handleTyping();
                  setFormData((prev) => ({ ...prev, terms_conditions: e.target.value }));
                }}
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
                onChange={(e) => {
                  handleTyping();
                  setFormData((prev) => ({ ...prev, notes: e.target.value }));
                }}
                placeholder="Internal notes (not visible to client)..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Private notes for your reference only</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/quotations')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : id ? 'Update Quotation' : 'Create Quotation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
