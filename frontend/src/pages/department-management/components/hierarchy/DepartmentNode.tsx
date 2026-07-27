import { Position, Handle } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  UserCheck,
  Lock,
  Unlock,
} from 'lucide-react';

const DepartmentNode = ({ data }: { data: any }) => {
  const {
    dept,
    onDepartmentClick,
    onExpand,
    isExpanded,
    hasChildren,
    members = [],
    isLoading = false,
    isLocked = false,
    onToggleLock = () => {},
    connectionMode = false,
  } = data || {};

  return (
    <div
      className={`border-2 rounded-lg p-3 bg-card hover:shadow-lg transition-all w-[220px] relative ${
        data.level === 0
          ? 'border-primary shadow-md bg-primary/10'
          : 'border-border hover:border-primary/50'
      } ${isLocked ? 'opacity-70' : ''} ${connectionMode ? 'ring-2 ring-primary/50' : ''} ${
        connectionMode ? 'cursor-default' : 'cursor-pointer'
      } ${!dept.is_active ? 'opacity-60 border-dashed border-muted-foreground/50' : ''}`}
      onClick={() => !connectionMode && onDepartmentClick(dept)}
    >
      {connectionMode && !isLocked && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="source"
            className="!bg-primary !border-2 !border-white !w-4 !h-4"
            style={{ bottom: -8 }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="target"
            className="!bg-green-500 !border-2 !border-white !w-4 !h-4"
            style={{ top: -8 }}
          />
        </>
      )}

      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => { e.stopPropagation(); onToggleLock(dept.id); }}
          title={isLocked ? 'Unlock node' : 'Lock node'}
        >
          {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-sm truncate flex-1">{dept.name}</h3>
          {!dept.is_active && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">Inactive</Badge>
          )}
        </div>

        {dept.manager && (
          <div className="flex items-center gap-1">
            <UserCheck className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">{dept.manager.full_name}</p>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap mt-1">
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            <Users className="h-2.5 w-2.5 mr-1" />
            {dept._count?.team_assignments || 0}
          </Badge>
          {dept.budget && dept.budget > 0 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              ₹{(dept.budget / 1000).toFixed(0)}K
            </Badge>
          )}
        </div>

        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onExpand(dept.id); }}
            className="h-6 w-full mt-1.5 text-xs"
          >
            {isExpanded ? (
              <><ChevronUp className="h-3 w-3 mr-1" />Hide</>
            ) : (
              <><ChevronDown className="h-3 w-3 mr-1" />Show</>
            )}
          </Button>
        )}

        {isExpanded && (
          <div className="mt-2 pt-2 border-t">
            {isLoading ? (
              <div className="flex items-center justify-center py-1">
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-1">{members.length} members</p>
                <div className="space-y-0.5 max-h-20 overflow-y-auto">
                  {members.slice(0, 2).map((member: any) => (
                    <div key={member.id} className="flex items-center gap-1 p-1 rounded bg-muted/50">
                      <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-2 w-2 text-primary" />
                      </div>
                      <p className="text-xs truncate flex-1">{member.full_name}</p>
                    </div>
                  ))}
                  {members.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">+{members.length - 2} more</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-1">No members</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const nodeTypes = { department: DepartmentNode };
