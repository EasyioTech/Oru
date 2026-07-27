import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { AttendanceStatsCards } from './AttendanceStatsCards';
import { AttendanceDetailsList } from './AttendanceDetailsList';
import { AttendanceReportsDialog } from './AttendanceReportsDialog';
import type { AttendanceRecord, AttendanceStats } from './types';

interface EmployeeViewProps {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  attendanceStats: AttendanceStats;
  todayAttendance: AttendanceRecord[];
  showReportsDialog: boolean;
  setShowReportsDialog: (v: boolean) => void;
  reportData: unknown;
  reportLoading: boolean;
  handleViewReports: () => void;
  handleExportReport: () => void;
  getStatusColor: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}

export function EmployeeView({
  date, setDate,
  attendanceStats, todayAttendance,
  showReportsDialog, setShowReportsDialog,
  reportData, reportLoading,
  handleViewReports, handleExportReport,
  getStatusColor,
}: EmployeeViewProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Attendance</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track and manage employee attendance</p>
        </div>
        <Button onClick={handleViewReports} className="w-full sm:w-auto">
          <CalendarIcon className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      <AttendanceStatsCards stats={attendanceStats} attendanceRate={0} variant="employee" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <AttendanceDetailsList records={todayAttendance} date={date} getStatusColor={getStatusColor} />
        </div>
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Calendar</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Select a date to view attendance</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center sm:block overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border w-full min-w-[280px] mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
