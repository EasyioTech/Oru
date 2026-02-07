/**
 * Department advanced filters
 */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepartmentFiltersProps {
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterManager: string;
  setFilterManager: (v: string) => void;
  filterParent: string;
  setFilterParent: (v: string) => void;
  minBudget: string;
  setMinBudget: (v: string) => void;
  maxBudget: string;
  setMaxBudget: (v: string) => void;
  managers: Array<{ user_id: string; full_name: string }>;
  parentDepartments: Array<{ id: string; name: string }>;
  includeStatusFilter?: boolean;
}

export function DepartmentFilters({
  filterStatus,
  setFilterStatus,
  filterManager,
  setFilterManager,
  filterParent,
  setFilterParent,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  managers,
  parentDepartments,
  includeStatusFilter = true,
}: DepartmentFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {includeStatusFilter && (
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">Manager</label>
            <Select value={filterManager} onValueChange={setFilterManager}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Parent Department</label>
            <Select value={filterParent} onValueChange={setFilterParent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {parentDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Min Budget</label>
            <Input
              type="number"
              placeholder="0"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Max Budget</label>
            <Input
              type="number"
              placeholder="No limit"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
