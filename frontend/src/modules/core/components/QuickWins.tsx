import { useDashboardContext } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuickWinsProps {
  workspaceId?: string;
}

const QUICK_WIN_ACTIONS: Record<string, { label: string; url: string; impact: string }> = {
  invite_team: { label: 'Invite your first team member', url: '/settings/team', impact: 'Enables collaboration' },
  setup_payment: { label: 'Add payment method', url: '/settings/billing', impact: 'Unlocks invoicing' },
  create_client: { label: 'Add your first client', url: '/crm/clients/new', impact: 'Start tracking relationships' },
  enable_hr: { label: 'Enable HR module', url: '/settings/modules', impact: 'Manage employees' },
  create_project: { label: 'Start your first project', url: '/projects/new', impact: 'Begin planning' },
};

export function QuickWins({ workspaceId }: QuickWinsProps) {
  const { data: context } = useDashboardContext(workspaceId);

  if (!context?.quick_wins || context.quick_wins.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          Quick Wins
        </CardTitle>
        <CardDescription>Easy actions to boost your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {context.quick_wins.map((win: any) => {
            const action = QUICK_WIN_ACTIONS[win.id];
            if (!action) return null;

            return (
              <div key={win.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{action.impact}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => (window.location.href = action.url)}
                  className="gap-1"
                >
                  Go
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
