/**
 * Project Metrics Cards Component
 * Modern design-token based metrics matching CRM layout
 */

import { FloatingCard, MicroLabel } from '@/components/ui/design-tokens';
import { FolderKanban, Zap, CheckCircle2, PauseCircle, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../utils/projectUtils';

interface ProjectMetricsProps {
  stats: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
    totalBudget: number;
  };
}

export const ProjectMetrics = ({ stats }: ProjectMetricsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
      <FloatingCard delay={0.05} className="p-6">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <MicroLabel>Total Projects</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
              {stats.total}
            </div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard delay={0.1} className="p-6">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <MicroLabel>Active</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
              {stats.active}
            </div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard delay={0.15} className="p-6">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <MicroLabel>Completed</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
              {stats.completed}
            </div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard delay={0.2} className="p-6">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
            <PauseCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <MicroLabel>On Hold</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
              {stats.onHold}
            </div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard delay={0.25} className="p-6 sm:col-span-2 lg:col-span-1">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <MicroLabel>Total Budget</MicroLabel>
            <div 
              className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-1 truncate"
              title={`₹${stats.totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            >
              {formatCurrency(stats.totalBudget)}
            </div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
};
