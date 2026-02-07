import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ReportFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
}

export const ReportFilters = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange
}: ReportFiltersProps) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
    <div className="relative flex-1 min-w-0">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        placeholder="Search reports..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
    <div className="flex flex-wrap gap-3 sm:gap-4">
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="financial">Financial</SelectItem>
          <SelectItem value="hr">HR</SelectItem>
          <SelectItem value="project">Project</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const date = new Date(parseInt(selectedYear), month - 1);
            return (
              <SelectItem key={month} value={`${selectedYear}-${String(month).padStart(2, '0')}`}>
                {date.toLocaleString('default', { month: 'long' })}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  </div>
);
