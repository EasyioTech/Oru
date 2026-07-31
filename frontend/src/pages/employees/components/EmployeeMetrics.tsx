import { Users, UserCheck, CalendarDays, TrendingUp } from "lucide-react";
import { FloatingCard, MicroLabel } from "@/components/ui/design-tokens";

interface EmployeeMetricsProps {
  stats: {
    total: number;
    active: number;
    onLeave: number;
    engagementScore: number;
  };
}

export const EmployeeMetrics = ({ stats }: EmployeeMetricsProps) => {
  const metrics = [
    { 
      title: "Total Team", 
      value: stats.total, 
      icon: Users, 
      colorClass: "text-blue-500",
      delay: 0
    },
    { 
      title: "Active Now", 
      value: stats.active, 
      icon: UserCheck, 
      colorClass: "text-emerald-500",
      delay: 0.1
    },
    { 
      title: "On Leave", 
      value: stats.onLeave, 
      icon: CalendarDays, 
      colorClass: "text-amber-500",
      delay: 0.2
    },
    { 
      title: "Engagement", 
      value: `${stats.engagementScore}%`, 
      icon: TrendingUp, 
      colorClass: "text-sky-500",
      delay: 0.3
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <FloatingCard key={m.title} delay={m.delay} className="p-5 flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
              <MicroLabel>{m.title}</MicroLabel>
              <div className={`p-2 rounded-xl bg-white/40 ${m.colorClass}`}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
            </div>
            <div className="text-[28px] font-bold text-gray-900 tracking-tight leading-none mt-2">
              {m.value}
            </div>
          </FloatingCard>
        );
      })}
    </div>
  );
};
