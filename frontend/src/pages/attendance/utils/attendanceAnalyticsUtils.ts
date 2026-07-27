import type { WeeklyTrend, DepartmentStats, AttendanceStats, AttendanceInsight } from '../components';

export async function fetchTrends(db: any, selectedPeriod: 'week' | 'month'): Promise<WeeklyTrend[]> {
  try {
    const days = selectedPeriod === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const trends: WeeklyTrend[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const { data: attendanceData } = await db.from('attendance').select('*').eq('date', dateStr);
      const { data: employeesData } = await db.from('employee_details').select('user_id').eq('is_active', true);

      const totalEmployees = employeesData?.length || 0;
      const present = attendanceData?.filter((r: any) => {
        if (!r.check_in_time) return false;
        const t = new Date(r.check_in_time);
        return !(t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 15));
      }).length || 0;
      const late = attendanceData?.filter((r: any) => {
        if (!r.check_in_time) return false;
        const t = new Date(r.check_in_time);
        return t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 15);
      }).length || 0;
      const absent = totalEmployees - (attendanceData?.length || 0);
      const attendanceRate = totalEmployees > 0 ? ((present + late) / totalEmployees) * 100 : 0;

      trends.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present, absent, late,
        attendanceRate: Math.round(attendanceRate),
      });
    }

    return trends;
  } catch (error) {
    console.error('Error fetching weekly trends:', error);
    return [];
  }
}

export async function fetchDeptStats(
  db: any,
  date: Date,
  toast: (opts: any) => void
): Promise<DepartmentStats[]> {
  try {
    const dateStr = date.toISOString().split('T')[0];

    const { data: employeesData } = await db.from('employee_details').select('user_id, is_active').eq('is_active', true);
    if (!employeesData || employeesData.length === 0) return [];

    const userIds = employeesData.map((emp: any) => emp.user_id);
    const { data: profilesData } = await db.from('profiles').select('user_id, department').in('user_id', userIds).eq('is_active', true);
    const userDeptMap = new Map<string, string>(
      profilesData?.map((p: any) => [p.user_id as string, (p.department as string) || 'Unassigned']) || []
    );

    const { data: attendanceData } = await db.from('attendance').select('*').eq('date', dateStr);
    const attendanceMap = new Map<string, any>(attendanceData?.map((a: any) => [a.employee_id as string, a]) || []);

    const deptStatsMap = new Map<string, { present: number; absent: number; late: number; total: number }>();

    employeesData?.forEach((emp: any) => {
      const empId = emp.user_id as string;
      const deptName = userDeptMap.get(empId) || 'Unassigned';
      if (!deptStatsMap.has(deptName)) deptStatsMap.set(deptName, { present: 0, absent: 0, late: 0, total: 0 });
      const stats = deptStatsMap.get(deptName)!;
      stats.total++;
      const attendance = attendanceMap.get(empId);
      if (attendance?.check_in_time) {
        const t = new Date(attendance.check_in_time);
        if (t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 15)) { stats.late++; } else { stats.present++; }
      } else {
        stats.absent++;
      }
    });

    const stats: DepartmentStats[] = Array.from(deptStatsMap.entries()).map(([department, data]) => ({
      department, ...data,
      attendanceRate: data.total > 0 ? Math.round(((data.present + data.late) / data.total) * 100) : 0,
    }));

    return stats.sort((a, b) => b.attendanceRate - a.attendanceRate);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    toast({ title: 'Error', description: 'Failed to fetch department statistics', variant: 'destructive' });
    return [];
  }
}

export function generateInsightsList(
  attendanceStats: AttendanceStats,
  departmentStats: DepartmentStats[]
): AttendanceInsight[] {
  const insightsList: AttendanceInsight[] = [];
  const totalEmployees = attendanceStats.present + attendanceStats.absent + attendanceStats.late + attendanceStats.onLeave;
  const absentRate = totalEmployees > 0 ? (attendanceStats.absent / totalEmployees) * 100 : 0;
  const lateRate = totalEmployees > 0 ? (attendanceStats.late / totalEmployees) * 100 : 0;
  const attendanceRate = totalEmployees > 0 ? ((attendanceStats.present + attendanceStats.late) / totalEmployees) * 100 : 0;

  if (absentRate > 20) {
    insightsList.push({ type: 'warning', title: 'High Absenteeism', message: `${absentRate.toFixed(1)}% of employees are absent today`, count: attendanceStats.absent });
  }
  if (lateRate > 15) {
    insightsList.push({ type: 'warning', title: 'High Late Arrivals', message: `${lateRate.toFixed(1)}% of employees arrived late today`, count: attendanceStats.late });
  }
  if (attendanceRate >= 90) {
    insightsList.push({ type: 'success', title: 'Excellent Attendance', message: `${attendanceRate.toFixed(1)}% attendance rate today` });
  }
  const problematicDepts = departmentStats.filter(d => d.attendanceRate < 70);
  if (problematicDepts.length > 0) {
    insightsList.push({ type: 'error', title: 'Department Alert', message: `${problematicDepts.length} department(s) have attendance below 70%`, count: problematicDepts.length });
  }

  return insightsList;
}
