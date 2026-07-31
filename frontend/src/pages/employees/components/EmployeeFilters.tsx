import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { FloatingCard, PillButton } from "@/components/ui/design-tokens";

interface EmployeeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAddMember: () => void;
}

export const EmployeeFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddMember,
}: EmployeeFiltersProps) => {
  return (
    <FloatingCard className="p-2 sm:p-3 bg-white/50 border border-gray-100 flex flex-col sm:flex-row gap-3 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          className="pl-11 h-11 bg-white border-transparent rounded-2xl focus-visible:ring-gray-200 shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex w-full sm:w-auto gap-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-40 h-11 bg-white border-transparent rounded-2xl shadow-sm focus:ring-gray-200 transition-all">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-xl">
            <SelectItem value="all" className="rounded-lg cursor-pointer">All Status</SelectItem>
            <SelectItem value="active" className="rounded-lg cursor-pointer">Active</SelectItem>
            <SelectItem value="inactive" className="rounded-lg cursor-pointer">Inactive</SelectItem>
            <SelectItem value="on_leave" className="rounded-lg cursor-pointer">On Leave</SelectItem>
          </SelectContent>
        </Select>
        
        <PillButton onClick={onAddMember} className="h-11 px-6 bg-black text-white hover:bg-gray-800 shadow-md flex-shrink-0">
          <Plus className="h-4 w-4 mr-2" /> 
          Add Member
        </PillButton>
      </div>
    </FloatingCard>
  );
};

