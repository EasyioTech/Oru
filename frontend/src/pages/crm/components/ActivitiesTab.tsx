/**
 * Activities Tab Component
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActivityIcon } from '../utils/crmUtils';

interface ActivitiesTabProps {
  activities: any[];
  loading: boolean;
  onNewActivity: () => void;
  onEditActivity: (activity: any) => void;
  onDeleteActivity: (activity: any) => void;
}

export const ActivitiesTab = ({
  activities,
  loading,
  onNewActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivitiesTabProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[17px] font-semibold text-gray-900">Activities</h3>
        <Button variant="outline" onClick={onNewActivity} className="h-9 rounded-full px-5 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 text-[13px] font-medium shadow-sm transition-all">
          <Plus className="h-4 w-4 mr-2" />
          New Activity
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500 font-medium">Loading activities...</div>
      ) : (
        <div className="grid gap-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-[14px] text-gray-500 bg-white/50 border border-gray-100 rounded-3xl">
              No activities found. Create your first activity to get started.
            </div>
          ) : (
            activities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.activity_type);
              const lead = activity.leads || null;
              return (
                <div 
                  key={activity.id} 
                  className="group relative bg-white/50 border border-gray-100 hover:border-gray-200 hover:bg-white rounded-3xl p-5 transition-all duration-300 cursor-pointer" 
                  onClick={() => navigate(`/crm/activities/${activity.id}`)}
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                      <ActivityIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[16px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{activity.subject}</h4>
                      <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        {lead ? `${lead.lead_number} • ${lead.company_name || lead.name}` : 'No lead assigned'}
                      </p>
                      {activity.description && (
                        <p className="text-[14px] text-gray-600 mt-3 line-clamp-2 leading-relaxed">{activity.description}</p>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4 sm:gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0" onClick={(e) => e.stopPropagation()}>
                      {activity.due_date && (
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(activity.due_date).toLocaleDateString()}
                        </div>
                      )}
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="rounded-full font-medium px-3">
                        {activity.status}
                      </Badge>
                      <div className="flex gap-1.5 mt-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100" onClick={() => onEditActivity(activity)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteActivity(activity)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

