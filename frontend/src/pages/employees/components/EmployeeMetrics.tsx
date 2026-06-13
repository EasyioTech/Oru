import { Users, UserCheck, UserX, Shield, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeMetricsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    managers: number;
    departments: number;
  };
}

const metrics = (stats: EmployeeMetricsProps['stats']) => [
  { title: "Total Employees", value: stats.total, icon: Users, accent: "text-blue-500", dot: "bg-blue-500" },
  { title: "Active", value: stats.active, icon: UserCheck, accent: "text-emerald-500", dot: "bg-emerald-500" },
  { title: "Inactive", value: stats.inactive, icon: UserX, accent: "text-rose-500", dot: "bg-rose-500" },
  { title: "Admins", value: stats.admins, icon: Shield, accent: "text-violet-500", dot: "bg-violet-500" },
  { title: "Managers", value: stats.managers, icon: Briefcase, accent: "text-amber-500", dot: "bg-amber-500" },
  { title: "Departments", value: stats.departments, icon: Building2, accent: "text-sky-500", dot: "bg-sky-500" },
];

export const EmployeeMetrics = ({ stats }: EmployeeMetricsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
    {metrics(stats).map((m) => {
      const Icon = m.icon;
      return (
        <div
          key={m.title}
          className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{m.title}</span>
            <Icon className={cn("h-4 w-4", m.accent)} strokeWidth={1.75} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground">{m.value}</span>
            <span className={cn("h-1.5 w-6 rounded-full opacity-60", m.dot)} />
          </div>
        </div>
      );
    })}
  </div>
);
