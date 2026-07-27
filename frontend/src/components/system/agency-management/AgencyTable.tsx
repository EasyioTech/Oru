import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Users, Building2, Calendar, Eye, Settings, Activity, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { AgencySummary as AgencyData } from '@/types/system';
import { formatDate, getPlanColor } from './utils';

interface Props {
  agencies: AgencyData[];
  filteredAgencies: AgencyData[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedPlan: string;
  setSelectedPlan: (v: string) => void;
  isUpdating: boolean;
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
  onManageUsers: (id: string) => void;
  onViewUsage: (id: string) => void;
  onOpenEdit: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onOpenDelete: (id: string) => void;
}

export function AgencyTable({
  agencies, filteredAgencies, searchTerm, setSearchTerm,
  selectedPlan, setSelectedPlan, isUpdating, onRefresh,
  onViewDetails, onManageUsers, onViewUsage, onOpenEdit, onToggleActive, onOpenDelete,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Agency Management</CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">Refresh</Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search agencies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Plan: {selectedPlan === 'all' ? 'All' : selectedPlan}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['all', 'basic', 'pro', 'enterprise'].map(p => (
                <DropdownMenuItem key={p} onClick={() => setSelectedPlan(p)}>
                  {p === 'all' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {agencies.length === 0 ? 'No agencies found' : 'No agencies match your search criteria'}
                </TableCell>
              </TableRow>
            ) : filteredAgencies.map(agency => (
              <TableRow key={agency.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{agency.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {agency.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><div className="text-sm">{agency.domain || 'Not set'}</div></TableCell>
                <TableCell>
                  <Badge className={`capitalize ${getPlanColor(agency.subscription_plan)}`}>{agency.subscription_plan}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{agency.user_count}/{agency.max_users || '∞'}</span>
                  </div>
                </TableCell>
                <TableCell><div className="text-sm">{agency.project_count}</div></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{formatDate(agency.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={agency.is_active ? 'default' : 'secondary'}>{agency.is_active ? 'Active' : 'Inactive'}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(agency.id)}>
                        <Eye className="mr-2 h-4 w-4" />View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageUsers(agency.id)}>
                        <Users className="mr-2 h-4 w-4" />Manage Users
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewUsage(agency.id)}>
                        <Activity className="mr-2 h-4 w-4" />View Usage
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenEdit(agency.id)}>
                        <Settings className="mr-2 h-4 w-4" />Edit Agency
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={agency.is_active ? 'text-destructive' : 'text-green-600'}
                        onClick={() => onToggleActive(agency.id, agency.is_active)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                          agency.is_active ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        {agency.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onOpenDelete(agency.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />Delete agency
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
