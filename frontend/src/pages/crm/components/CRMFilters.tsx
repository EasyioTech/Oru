/**
 * CRM Filters Component
 */

import { FloatingCard } from '@/components/ui/design-tokens';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CRMFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
}

export const CRMFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}: CRMFiltersProps) => {
  return (
    <FloatingCard className="p-4 sm:p-5 mt-4">
      <div className="flex flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads by company, contact, or lead number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-11 bg-gray-50/50 border-gray-200/60 rounded-2xl focus-visible:ring-gray-300"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 bg-gray-50/50 border-gray-200/60 rounded-2xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-200/60">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 bg-gray-50/50 border-gray-200/60 rounded-2xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-200/60">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FloatingCard>
  );
};

