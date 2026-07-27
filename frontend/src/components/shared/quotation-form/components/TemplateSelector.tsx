import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { QuotationTemplate } from '../types';

interface TemplateSelectorProps {
  templates: QuotationTemplate[];
  templateId: string | null | undefined;
  onSelect: (templateId: string) => void;
}

export function TemplateSelector({ templates, templateId, onSelect }: TemplateSelectorProps) {
  if (templates.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Quick Start: Use Template</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={onSelect} value={templateId || undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template to pre-fill form (optional)" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
