import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye, Loader2 } from 'lucide-react';
import type { ReportTemplate } from './types';
import { getColorClasses, getIconBgClasses, getCategoryBadgeColor } from './utils';

interface ReportTemplateCardProps {
  template: ReportTemplate;
  lastGenerated: string | null;
  onGenerate: () => void;
  onSchedule: () => void;
  onViewRoute?: () => void;
  generating: boolean;
}

export const ReportTemplateCard = ({
  template,
  lastGenerated,
  onGenerate,
  onSchedule,
  onViewRoute,
  generating
}: ReportTemplateCardProps) => {
  const Icon = template.icon;
  return (
    <Card className="group cursor-pointer hover:shadow-lg border hover:border-primary/20 flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-3 space-y-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${getIconBgClasses(template.color)} flex-shrink-0`}>
              <Icon className={getColorClasses(template.color)} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <CardTitle className="text-sm sm:text-base font-semibold leading-tight mb-1 line-clamp-2 break-words">
                {template.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                {template.description}
              </p>
            </div>
          </div>
          <Badge
            className={`${getCategoryBadgeColor(template.category)} flex-shrink-0 text-xs px-1.5 py-0.5 whitespace-nowrap`}
            variant="secondary"
          >
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3 flex-1 flex flex-col justify-end overflow-hidden">
        <div className="space-y-2.5 w-full">
          {lastGenerated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Last: <span className="font-medium text-foreground">{new Date(lastGenerated).toLocaleDateString()}</span></span>
            </div>
          )}
          <div className="flex flex-col gap-2 w-full">
            <Button size="sm" onClick={onGenerate} disabled={generating} className="w-full text-xs h-8">
              {generating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
              Generate
            </Button>
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" onClick={onSchedule} className="flex-1 text-xs h-8">
                <Clock className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
              {template.route && onViewRoute && (
                <Button variant="outline" size="sm" onClick={onViewRoute} className="text-xs h-8 px-2" title="View related page">
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
