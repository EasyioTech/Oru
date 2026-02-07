import { Card, CardContent } from '@/components/ui/card';
import { FileText, DollarSign, Users, Briefcase } from 'lucide-react';

interface ReportStatsCardsProps {
  stats: {
    total: number;
    financial: number;
    hr: number;
    project: number;
  };
}

export const ReportStatsCards = ({ stats }: ReportStatsCardsProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Templates</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.total}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 flex-shrink-0">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Financial Reports</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.financial}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex-shrink-0">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">HR Reports</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.hr}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex-shrink-0">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Project Reports</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.project}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
