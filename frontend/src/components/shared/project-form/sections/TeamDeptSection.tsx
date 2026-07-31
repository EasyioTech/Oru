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
      <div className="space-y-2.5">
        <Label className="text-sm font-medium">Team Members</Label>
        <Popover open={teamMemberSearchOpen} onOpenChange={setTeamMemberSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={loadingEmployees}>
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
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedTeamMemberObjects.map(emp => (
              <Badge key={emp.id} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium">
                {emp.full_name}
                <button type="button" onClick={() => toggleTeamMember(emp.user_id)} className="ml-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-full p-0.5 transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2.5 pt-4">
        <Label className="text-sm font-medium">Departments</Label>
        <div className="border border-border/60 rounded-md p-3 max-h-52 overflow-y-auto bg-background/50">
          {loadingDepartments
            ? <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            : departments.length === 0
              ? <p className="text-sm text-muted-foreground py-4 text-center">No departments available</p>
              : <div className="space-y-3">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center space-x-3 p-1">
                      <Checkbox id={`dept-${dept.id}`} checked={selectedDepartments.includes(dept.id)} onCheckedChange={() => toggleDepartment(dept.id)} />
                      <label htmlFor={`dept-${dept.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1 select-none">
                        {dept.name}
                        {dept.member_count !== undefined && <span className="text-xs text-muted-foreground ml-2 font-normal">({dept.member_count} members)</span>}
                      </label>
                    </div>
                  ))}
                </div>
          }
        </div>
        {selectedDepartmentObjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedDepartmentObjects.map(dept => (
              <Badge key={dept.id} variant="outline" className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium border-border/80 bg-background">
                {dept.name}
                <button type="button" onClick={() => toggleDepartment(dept.id)} className="ml-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-full p-0.5 transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
