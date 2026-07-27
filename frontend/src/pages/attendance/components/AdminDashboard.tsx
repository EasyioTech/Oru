import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Building2 } from 'lucide-react';
import { AttendanceStatsCards } from './AttendanceStatsCards';
import { AttendanceInsights } from './AttendanceInsights';
import { AttendanceReportsDialog } from './AttendanceReportsDialog';
import { OverviewTab } from './OverviewTab';
import { TrendsTab } from './TrendsTab';
import { DepartmentsTab } from './DepartmentsTab';
import { DetailsTab } from './DetailsTab';
import type { AttendanceRecord, AttendanceStats, WeeklyTrend, DepartmentStats, AttendanceInsight } from './types';

interface AdminDashboardProps {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  attendanceStats: AttendanceStats;
  todayAttendance: AttendanceRecord[];
  weeklyTrends: WeeklyTrend[];
  departmentStats: DepartmentStats[];
  insights: AttendanceInsight[];
  selectedPeriod: 'week' | 'month';
  setSelectedPeriod: (v: 'week' | 'month') => void;
  urlDepartmentName: string | null;
  showReportsDialog: boolean;
  setShowReportsDialog: (v: boolean) => void;
  reportData: unknown;
  reportLoading: boolean;
  handleViewReports: () => void;
  handleExportReport: () => void;
  getStatusColor: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}

export function AdminDashboard({
  date, setDate,
  attendanceStats, todayAttendance,
  weeklyTrends, departmentStats, insights,
  selectedPeriod, setSelectedPeriod,
  urlDepartmentName,
  showReportsDialog, setShowReportsDialog,
  reportData, reportLoading,
  handleViewReports, handleExportReport,
  getStatusColor,
}: AdminDashboardProps) {
  const total = attendanceStats.present + attendanceStats.absent + attendanceStats.late + attendanceStats.onLeave;
  const attendanceRate = total > 0
    ? Math.round(((attendanceStats.present + attendanceStats.late) / total) * 100)
    : 0;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Attendance Dashboard</h1>
            {urlDepartmentName && (
              <Badge variant="secondary" className="text-sm">
                <Building2 className="h-3 w-3 mr-1" />
                {decodeURIComponent(urlDepartmentName)}
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {urlDepartmentName
              ? `Attendance for ${decodeURIComponent(urlDepartmentName)} department - ${date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'today'}`
              : `Overview and insights for ${date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'today'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(v: 'week' | 'month') => setSelectedPeriod(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleViewReports} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <AttendanceInsights insights={insights} />
      <AttendanceStatsCards stats={attendanceStats} attendanceRate={attendanceRate} variant="admin" />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab stats={attendanceStats} attendanceRate={attendanceRate} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <TrendsTab trends={weeklyTrends} period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <DepartmentsTab departmentStats={departmentStats} />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <DetailsTab records={todayAttendance} date={date} setDate={setDate} getStatusColor={getStatusColor} />
        </TabsContent>
      </Tabs>

      <AttendanceReportsDialog
        open={showReportsDialog}
        onOpenChange={setShowReportsDialog}
        reportData={reportData}
        reportLoading={reportLoading}
        onExport={handleExportReport}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}
