import { useDashboardSection } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface WorkspaceHealthProps {
  workspaceId?: string;
}

export function WorkspaceHealth({ workspaceId }: WorkspaceHealthProps) {
  const section = useDashboardSection('workspace_health', workspaceId);

  if (!section?.data) return null;

  const { score, needs_attention = [], strengths = [], quick_wins = [] } = section.data;

  const getHealthColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Health</CardTitle>
        <CardDescription>Overall health score and insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Health Score</span>
          <span className={`text-2xl font-bold ${getHealthColor(score)}`}>{score}%</span>
        </div>

        {needs_attention?.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Needs Attention</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {needs_attention.slice(0, 3).map((item: string, i: number) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {strengths?.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Strengths</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {strengths.slice(0, 2).map((item: string, i: number) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {quick_wins?.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Quick Wins</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {quick_wins.slice(0, 2).map((win: any, i: number) => (
                <li key={i}>• {win.title}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
