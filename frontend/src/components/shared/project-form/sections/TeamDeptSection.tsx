import { Search, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { type UseProjectFormReturn } from '../useProjectForm';

interface TeamDeptSectionProps {
  ctx: Pick<UseProjectFormReturn, 'employees' | 'loadingEmployees' | 'selectedTeamMembers' | 'teamMemberSearchOpen' | 'setTeamMemberSearchOpen' | 'teamMemberSearchTerm' | 'setTeamMemberSearchTerm' | 'filteredEmployees' | 'selectedTeamMemberObjects' | 'toggleTeamMember' | 'departments' | 'loadingDepartments' | 'selectedDepartments' | 'selectedDepartmentObjects' | 'toggleDepartment'>;
}

export function TeamDeptSection({ ctx }: TeamDeptSectionProps) {
  const { loadingEmployees, selectedTeamMembers, teamMemberSearchOpen, setTeamMemberSearchOpen, teamMemberSearchTerm, setTeamMemberSearchTerm, filteredEmployees, selectedTeamMemberObjects, toggleTeamMember, departments, loadingDepartments, selectedDepartments, selectedDepartmentObjects, toggleDepartment } = ctx;
  return (
    <>
      <div className="space-y-2">
        <Label>Team Members</Label>
        <Popover open={teamMemberSearchOpen} onOpenChange={setTeamMemberSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between" disabled={loadingEmployees}>
              {selectedTeamMemberObjects.length > 0 ? `${selectedTeamMemberObjects.length} member(s) selected` : "Select team members..."}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search employees..." value={teamMemberSearchTerm} onValueChange={setTeamMemberSearchTerm} />
              <CommandList>
                <CommandEmpty>No employees found.</CommandEmpty>
                <CommandGroup>
                  {filteredEmployees.map(emp => (
                    <CommandItem key={emp.id} value={emp.id} onSelect={() => toggleTeamMember(emp.user_id)}>
                      <Checkbox checked={selectedTeamMembers.includes(emp.user_id)} onCheckedChange={() => toggleTeamMember(emp.user_id)} className="mr-2" />
                      {emp.full_name}
                      {emp.department && <span className="text-xs text-muted-foreground ml-2">({emp.department})</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedTeamMemberObjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTeamMemberObjects.map(emp => (
              <Badge key={emp.id} variant="secondary" className="flex items-center gap-1">
                {emp.full_name}
                <button type="button" onClick={() => toggleTeamMember(emp.user_id)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Departments</Label>
        <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
          {loadingDepartments
            ? <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
            : departments.length === 0
              ? <p className="text-sm text-muted-foreground py-2">No departments available</p>
              : <div className="space-y-2">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center space-x-2">
                      <Checkbox id={`dept-${dept.id}`} checked={selectedDepartments.includes(dept.id)} onCheckedChange={() => toggleDepartment(dept.id)} />
                      <label htmlFor={`dept-${dept.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                        {dept.name}
                        {dept.member_count !== undefined && <span className="text-xs text-muted-foreground ml-2">({dept.member_count} members)</span>}
                      </label>
                    </div>
                  ))}
                </div>
          }
        </div>
        {selectedDepartmentObjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedDepartmentObjects.map(dept => (
              <Badge key={dept.id} variant="outline" className="flex items-center gap-1">
                {dept.name}
                <button type="button" onClick={() => toggleDepartment(dept.id)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
