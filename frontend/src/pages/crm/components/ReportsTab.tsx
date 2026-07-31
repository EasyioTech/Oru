/**
 * Reports Tab Component
 */

import { FloatingCard, MicroLabel } from '@/components/ui/design-tokens';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PIPELINE_STAGES, getStatusColor } from '../utils/crmUtils';

interface ReportsTabProps {
  leads: any[];
  activities: any[];
  loading: boolean;
  activitiesLoading: boolean;
}

export const ReportsTab = ({ leads, activities, loading, activitiesLoading }: ReportsTabProps) => {
  // Lead Source Performance
  const sourceStats: Record<string, { count: number; value: number }> = {};
  leads.forEach(lead => {
    const sourceId = lead.lead_source_id || lead.source_id || 'unknown';
    if (!sourceStats[sourceId]) {
      sourceStats[sourceId] = { count: 0, value: 0 };
    }
    sourceStats[sourceId].count++;
    sourceStats[sourceId].value += (lead.estimated_value || lead.value || 0);
  });

  return (
    <div className="space-y-6">
      <div className="px-2">
        <h3 className="text-[17px] font-semibold text-gray-900">CRM Reports & Analytics</h3>
        <p className="text-[13px] text-gray-500 mt-1">View insights and performance metrics for your CRM</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lead Source Performance */}
        <FloatingCard className="p-6">
          <div className="mb-6">
            <span className="text-[15px] font-bold text-gray-800">Lead Source Performance</span>
          </div>
          {loading ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(sourceStats).map(([sourceId, stats]) => (
                <div key={sourceId} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl bg-white/30 hover:bg-white/50 transition-colors">
                  <span className="text-[13px] font-medium text-gray-900">
                    {sourceId === 'unknown' ? 'Unknown Source' : `Source ${sourceId.slice(0, 8)}`}
                  </span>
                  <div className="text-right">
                    <div className="text-[14px] font-semibold text-gray-900">{stats.count} leads</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5">
                      ₹{stats.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(sourceStats).length === 0 && (
                <div className="text-center py-4 text-[13px] text-gray-500">No data available</div>
              )}
            </div>
          )}
        </FloatingCard>

        {/* Conversion Funnel */}
        <FloatingCard delay={0.1} className="p-6">
          <div className="mb-6">
            <span className="text-[15px] font-bold text-gray-800">Conversion Funnel</span>
          </div>
          {loading ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-4">
              {PIPELINE_STAGES.map(stage => {
                const stageLeads = leads.filter(l => l.status === stage.status);
                const percentage = leads.length > 0 ? (stageLeads.length / leads.length) * 100 : 0;
                return (
                  <div key={stage.status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-gray-700">{stage.name}</span>
                      <span className="text-[12px] font-semibold text-gray-900">{stageLeads.length} <span className="text-gray-400 font-normal">({percentage.toFixed(1)}%)</span></span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          )}
        </FloatingCard>

        {/* Activity Summary */}
        <FloatingCard delay={0.2} className="p-6">
          <div className="mb-6">
            <span className="text-[15px] font-bold text-gray-800">Activity Summary</span>
          </div>
          {activitiesLoading ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Total Activities', value: activities.length },
                { label: 'Pending', value: activities.filter(a => a.status === 'pending').length },
                { label: 'Completed', value: activities.filter(a => a.status === 'completed').length },
                { label: 'In Progress', value: activities.filter(a => a.status === 'in_progress').length }
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl bg-white/30 hover:bg-white/50 transition-colors">
                  <span className="text-[13px] font-medium text-gray-700">{stat.label}</span>
                  <span className="text-[15px] font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </FloatingCard>

        {/* Top Leads by Value */}
        <FloatingCard delay={0.3} className="p-6">
          <div className="mb-6">
            <span className="text-[15px] font-bold text-gray-800">Top Leads by Value</span>
          </div>
          {loading ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-3">
              {leads
                .filter(l => (l.estimated_value || l.value) && (l.estimated_value || l.value || 0) > 0)
                .sort((a, b) => ((b.estimated_value || b.value || 0) - (a.estimated_value || a.value || 0)))
                .slice(0, 5)
                .map(lead => (
                  <div key={lead.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl bg-white/30 hover:bg-white/50 transition-colors">
                    <div>
                      <div className="text-[14px] font-semibold text-gray-900">{lead.company_name || lead.name}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">{lead.lead_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-bold text-gray-900">
                        ₹{((lead.estimated_value || lead.value || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <Badge className={getStatusColor(lead.status) + ' mt-1 px-2 py-0 h-4 text-[9px]'} variant="outline">
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              {leads.filter(l => (l.estimated_value || l.value) && (l.estimated_value || l.value || 0) > 0).length === 0 && (
                <div className="text-center py-4 text-[13px] text-gray-500">
                  No leads with estimated value
                </div>
              )}
            </div>
          )}
        </FloatingCard>
      </div>
    </div>
  );
};

