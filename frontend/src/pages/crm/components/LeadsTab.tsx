/**
 * Leads Tab Component
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Plus, UserCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStatusColor, getPriorityColor } from '../utils/crmUtils';

interface LeadsTabProps {
  leads: any[];
  loading: boolean;
  onEditLead: (lead: any) => void;
  onDeleteLead: (lead: any) => void;
  onNewActivity: (leadId: string) => void;
  onConvertToClient: (lead: any) => void;
  onCreateQuotation: (lead: any) => void;
}

export const LeadsTab = ({
  leads,
  loading,
  onEditLead,
  onDeleteLead,
  onNewActivity,
  onConvertToClient,
  onCreateQuotation,
}: LeadsTabProps) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center py-8">Loading leads...</div>;
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No leads found. Create your first lead to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {leads.map((lead) => (
        <div 
          key={lead.id} 
          className="group relative bg-white/50 border border-gray-100 hover:border-gray-200 hover:bg-white rounded-3xl p-5 transition-all duration-300 cursor-pointer" 
          onClick={() => navigate(`/crm/leads/${lead.id}`)}
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{lead.company_name || lead.name}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">
                  {lead.lead_number} • {lead.contact_name || lead.name}
                </p>
              </div>
              <div className="flex gap-2 self-start">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                <Badge className={getPriorityColor(lead.priority || 'medium')}>
                  {lead.priority || 'medium'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y border-gray-100/50">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 block mb-1">Contact</span>
                <p className="text-[13px] font-medium text-gray-900">{lead.email || 'No email'}</p>
                <p className="text-[13px] text-gray-500">{lead.phone || 'No phone'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 block mb-1">Estimated Value</span>
                <p className="text-[14px] font-semibold text-gray-900">
                  {(lead.estimated_value || lead.value)
                    ? `₹${parseFloat((lead.estimated_value || lead.value || 0).toString()).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                    : '₹0'
                  }
                </p>
                <p className="text-[12px] text-gray-500">
                  Close: {lead.expected_close_date ? new Date(lead.expected_close_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 block mb-2">Probability</span>
                <div className="flex items-center gap-3">
                  <Progress value={lead.probability || 0} className="flex-1 h-1.5" />
                  <span className="text-[12px] font-medium text-gray-700">{lead.probability || 0}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center">
              <div className="text-[11px] font-medium text-gray-400">
                Created: {new Date(lead.created_at).toLocaleDateString()}
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => onEditLead(lead)} className="text-gray-500 hover:text-gray-900 h-8 rounded-full px-4 text-xs font-medium">
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onNewActivity(lead.id)} className="text-gray-500 hover:text-gray-900 h-8 rounded-full px-4 text-xs font-medium">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Activity
                </Button>
                {lead.status !== 'won' && lead.status !== 'lost' && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onConvertToClient(lead)} className="text-gray-500 hover:text-gray-900 h-8 rounded-full px-4 text-xs font-medium">
                      <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Convert
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onCreateQuotation(lead)} className="text-gray-500 hover:text-gray-900 h-8 rounded-full px-4 text-xs font-medium">
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> Quote
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => onDeleteLead(lead)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 rounded-full px-4 text-xs font-medium">
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

