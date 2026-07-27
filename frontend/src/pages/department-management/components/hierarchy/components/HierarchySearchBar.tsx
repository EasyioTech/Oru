import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, BarChart3 } from 'lucide-react';
import type { DeptStats } from '../hierarchyUtils';

interface HierarchySearchBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterManager: string;
  setFilterManager: (v: string) => void;
  managers: { id: string; name: string }[];
  showStats: boolean;
  setShowStats: (v: boolean) => void;
  stats: DeptStats;
  onExport: () => void;
}

export function HierarchySearchBar({
  searchTerm, setSearchTerm, filterManager, setFilterManager,
  managers, showStats, setShowStats, stats, onExport,
}: HierarchySearchBarProps) {
  return (
    <>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterManager} onValueChange={setFilterManager}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant={showStats ? 'default' : 'outline'} size="sm" onClick={() => setShowStats(!showStats)}>
              <BarChart3 className="h-4 w-4 mr-2" />Statistics
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />Export
            </Button>
          </div>
        </CardContent>
      </Card>
      {showStats && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Departments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rootDepartments}</p>
                <p className="text-sm text-muted-foreground">Root Departments</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
