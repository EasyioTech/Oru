/**
 * CRM Metrics Component
 */

import { FloatingCard, MicroLabel } from '@/components/ui/design-tokens';
import { Users2, Target, TrendingUp } from 'lucide-react';

interface CRMMetricsProps {
  totalLeads: number;
  activeLeads: number;
  conversionRate: number;
  pipelineValue: number;
}

export const CRMMetrics = ({ totalLeads, activeLeads, conversionRate, pipelineValue }: CRMMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FloatingCard delay={0.1} className="p-6">
        <div className="flex gap-4 items-start">
          <Users2 className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <MicroLabel>Total Leads</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 mt-1">{totalLeads}</div>
          </div>
        </div>
      </FloatingCard>
      
      <FloatingCard delay={0.2} className="p-6">
        <div className="flex gap-4 items-start">
          <Target className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <MicroLabel>Active Leads</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 mt-1">{activeLeads}</div>
          </div>
        </div>
      </FloatingCard>
      
      <FloatingCard delay={0.3} className="p-6">
        <div className="flex gap-4 items-start">
          <TrendingUp className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <MicroLabel>Conversion Rate</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 mt-1">{conversionRate}%</div>
          </div>
        </div>
      </FloatingCard>
      
      <FloatingCard delay={0.4} className="p-6">
        <div className="flex gap-4 items-start">
          <Target className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <MicroLabel>Pipeline Value</MicroLabel>
            <div className="text-[22px] font-semibold tracking-tight text-gray-900 mt-1">
              {pipelineValue > 0 
                ? `₹${pipelineValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : '₹0'
              }
            </div>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
};

