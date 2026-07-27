import { formatTime } from '@/utils/dateFormat';
import type { AttendanceRecord, AttendanceStats } from '../components';

export function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'present': return 'default';
    case 'late': return 'secondary';
    case 'absent': return 'destructive';
    case 'on-leave': return 'outline';
    default: return 'secondary';
  }
}

export async function fetchAttendanceForDate(
  db: any,
  selectedDate: Date,
  urlDepartmentId: string | null,
  agencySettings: any,
  toast: (opts: any) => void
): Promise<{ records: AttendanceRecord[]; stats: AttendanceStats } | null> {
  try {
    const dateStr = selectedDate.toISOString().split('T')[0];

    let departmentUserIds: string[] = [];
    if (urlDepartmentId) {
      const { data: assignments } = await db
        .from('team_assignments')
        .select('user_id')
        .eq('department_id', urlDepartmentId)
        .eq('is_active', true);
      if (assignments) {
        departmentUserIds = assignments.map((ta: any) => ta.user_id).filter(Boolean);
      }
    }

    let attendanceQuery = db.from('attendance').select('*').eq('date', dateStr);
    if (urlDepartmentId && departmentUserIds.length > 0) {
      attendanceQuery = attendanceQuery.in('employee_id', departmentUserIds);
    }
    const { data: attendanceData, error: attendanceError } = await attendanceQuery
      .order('check_in_time', { ascending: true });
    if (attendanceError) throw attendanceError;

    let employeesQuery = db.from('employee_details').select('user_id, first_name, last_name, is_active').eq('is_active', true);
    if (urlDepartmentId && departmentUserIds.length > 0) {
      employeesQuery = employeesQuery.in('user_id', departmentUserIds);
    }
    const { data: employeesData, error: employeesError } = await employeesQuery;
    if (employeesError) throw employeesError;

    const employeeIds = employeesData?.map((e: any) => e.user_id).filter(Boolean) || [];
    let profiles: any[] = [];
    if (employeeIds.length > 0) {
      const { data: profilesData, error: profilesError } = await db
        .from('profiles').select('user_id, full_name').in('user_id', employeeIds);
      if (profilesError) throw profilesError;
      profiles = profilesData || [];
    }
    const profileMap = new Map(profiles.map((p: any) => [p.user_id, p.full_name]));

    let leaveQuery = db
      .from('leave_requests')
      .select('user_id, status, start_date, end_date')
      .gte('end_date', dateStr)
      .lte('start_date', dateStr)
      .in('status', ['approved', 'pending']);
    if (urlDepartmentId && departmentUserIds.length > 0) {
      leaveQuery = leaveQuery.in('user_id', departmentUserIds);
    }
    const { data: leaveData, error: leaveError } = await leaveQuery;
    if (leaveError) throw leaveError;

    const onLeaveIds = new Set((leaveData || []).map((l: any) => l.user_id));
    const records: AttendanceRecord[] = [];
    const presentIds = new Set<string>();

    (attendanceData || []).forEach((record: any) => {
      const employee = employeesData?.find((e: any) => e.user_id === record.employee_id);
      const fullName = profileMap.get(record.employee_id) ||
        (employee ? `${employee.first_name} ${employee.last_name}`.trim() : 'Unknown Employee');
      presentIds.add(record.employee_id);

      let status = 'present';
      if (record.check_in_time) {
        const checkInTime = new Date(record.check_in_time);
        const workingHoursStart = agencySettings?.working_hours_start || '09:00';
        const [startHour, startMin] = workingHoursStart.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMin + 15;
        const checkInTimeMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
        if (checkInTimeMinutes > startTimeMinutes) status = 'late';
      }

      const checkIn = record.check_in_time ? formatTime(record.check_in_time, agencySettings?.timezone) : '-';
      const checkOut = record.check_out_time ? formatTime(record.check_out_time, agencySettings?.timezone) : '-';
      const totalHours = record.total_hours != null
        ? (typeof record.total_hours === 'string' ? parseFloat(record.total_hours) : Number(record.total_hours)) : 0;
      const hours = !isNaN(totalHours) && totalHours > 0 ? totalHours.toFixed(1) : '0.0';

      records.push({ id: record.id, name: fullName, checkIn, checkOut, status, hours, employee_id: record.employee_id });
    });

    employeesData?.forEach((employee: any) => {
      if (!presentIds.has(employee.user_id) && !onLeaveIds.has(employee.user_id)) {
        const fullName = profileMap.get(employee.user_id) || `${employee.first_name} ${employee.last_name}`.trim();
        records.push({ id: `absent-${employee.user_id}`, name: fullName, checkIn: '-', checkOut: '-', status: 'absent', hours: '0.0', employee_id: employee.user_id });
      }
    });

    (leaveData || []).forEach((leave: any) => {
      const userId = leave.user_id;
      if (!presentIds.has(userId)) {
        const employee = employeesData?.find((e: any) => e.user_id === userId);
        const fullName = profileMap.get(userId) || (employee ? `${employee.first_name} ${employee.last_name}`.trim() : 'Unknown Employee');
        records.push({ id: `leave-${userId}`, name: fullName, checkIn: '-', checkOut: '-', status: 'on-leave', hours: '0.0', employee_id: userId });
      }
    });

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const onLeave = records.filter(r => r.status === 'on-leave').length;

    return { records, stats: { present, absent, late, onLeave } };
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    toast({ title: 'Error', description: 'Failed to load attendance data. Please try again.', variant: 'destructive' });
    return null;
  }
}

export async function fetchReportForPeriod(
  db: any,
  startDate: Date,
  endDate: Date,
  toast: (opts: any) => void
): Promise<any> {
  try {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const { data: attendanceData, error: attendanceError } = await db
      .from('attendance').select('*').gte('date', startStr).lte('date', endStr);
    if (attendanceError) throw attendanceError;

    const { data: employeesData, error: employeesError } = await db
      .from('employee_details').select('user_id, first_name, last_name, is_active').eq('is_active', true);
    if (employeesError) throw employeesError;

    const employeeIds = employeesData?.map((e: any) => e.user_id).filter(Boolean) || [];
    let profiles: any[] = [];
    if (employeeIds.length > 0) {
      const { data: profilesData, error: profilesError } = await db
        .from('profiles').select('user_id, full_name').in('user_id', employeeIds);
      if (profilesError) throw profilesError;
      profiles = profilesData || [];
    }

    const totalRecords = attendanceData?.length || 0;
    const presentCount = attendanceData?.filter((r: any) => r.status === 'present' || r.check_in_time).length || 0;
    const lateCount = attendanceData?.filter((r: any) => {
      if (!r.check_in_time) return false;
      const t = new Date(r.check_in_time);
      return t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 15);
    }).length || 0;
    const totalHours = attendanceData?.reduce((sum: number, r: any) => {
      const h = r.total_hours != null ? (typeof r.total_hours === 'string' ? parseFloat(r.total_hours) : Number(r.total_hours)) : 0;
      return sum + (isNaN(h) ? 0 : h);
    }, 0) || 0;
    const avgHours = totalRecords > 0 ? totalHours / totalRecords : 0;

    return { startDate: startStr, endDate: endStr, totalRecords, presentCount, lateCount, totalHours: totalHours.toFixed(1), avgHours: avgHours.toFixed(1), attendanceData: attendanceData || [] };
  } catch (error) {
    console.error('Error fetching report data:', error);
    toast({ title: 'Error', description: 'Failed to load report data. Please try again.', variant: 'destructive' });
    return null;
  }
}
