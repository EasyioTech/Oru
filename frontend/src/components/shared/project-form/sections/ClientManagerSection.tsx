import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { type UseProjectFormReturn } from '../useProjectForm';

interface ClientManagerSectionProps {
  ctx: Pick<UseProjectFormReturn, 'formData' | 'setFormData' | 'clients' | 'loadingClients' | 'clientSearchOpen' | 'setClientSearchOpen' | 'clientSearchTerm' | 'setClientSearchTerm' | 'employees' | 'loadingEmployees' | 'filteredClients' | 'selectedClient'>;
}

export function ClientManagerSection({ ctx }: ClientManagerSectionProps) {
  const { formData, setFormData, loadingClients, clientSearchOpen, setClientSearchOpen, clientSearchTerm, setClientSearchTerm, employees, loadingEmployees, filteredClients, selectedClient } = ctx;
  const set = (patch: Partial<typeof formData>) => setFormData(p => ({ ...p, ...patch }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Client</Label>
          <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between h-11" disabled={loadingClients}>
                {selectedClient ? (selectedClient.company_name || selectedClient.name) : "Select client..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search clients..." value={clientSearchTerm} onValueChange={setClientSearchTerm} />
                <CommandList>
                  <CommandEmpty>No clients found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="__none__" onSelect={() => { set({ client_id: null }); setClientSearchOpen(false); }}>No Client</CommandItem>
                    {filteredClients.map(c => (
                      <CommandItem key={c.id} value={c.id} onSelect={() => { set({ client_id: c.id }); setClientSearchOpen(false); setClientSearchTerm(''); }}>
                        {c.company_name || c.name}
                        {c.email && <span className="text-xs text-muted-foreground ml-2">({c.email})</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Project Manager</Label>
          <Select value={formData.project_manager_id || '__none__'} onValueChange={v => set({ project_manager_id: v === '__none__' ? null : v })} disabled={loadingEmployees}>
            <SelectTrigger className="h-11"><SelectValue placeholder={loadingEmployees ? "Loading..." : "Select project manager"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No Project Manager</SelectItem>
              {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name} {e.department && `(${e.department})`}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2.5">
        <Label className="text-sm font-medium">Account Manager</Label>
        <Select value={formData.account_manager_id || '__none__'} onValueChange={v => set({ account_manager_id: v === '__none__' ? null : v })} disabled={loadingEmployees}>
          <SelectTrigger className="h-11"><SelectValue placeholder={loadingEmployees ? "Loading..." : "Select account manager"} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No Account Manager</SelectItem>
            {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name} {e.department && `(${e.department})`}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
