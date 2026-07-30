import { Loader2 } from 'lucide-react';
import { useAttendance } from './hooks/useAttendance';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeView } from './components/EmployeeView';

const Attendance = () => {
  const state = useAttendance();

  if (state.loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading attendance data...</span>
        </div>
      </div>
    );
  }

  if (state.isAdminView) {
    return (
      <AdminDashboard
        date={state.date}
        setDate={state.setDate}
        attendanceStats={state.attendanceStats}
        todayAttendance={state.todayAttendance}
        weeklyTrends={state.weeklyTrends}
        departmentStats={state.departmentStats}
        insights={state.insights}
        selectedPeriod={state.selectedPeriod}
        setSelectedPeriod={state.setSelectedPeriod}
        urlDepartmentName={(state as any).urlDepartmentName}
        showReportsDialog={state.showReportsDialog}
        setShowReportsDialog={state.setShowReportsDialog}
        reportData={state.reportData}
        reportLoading={state.reportLoading}
        handleViewReports={state.handleViewReports}
        handleExportReport={state.handleExportReport}
        getStatusColor={state.getStatusColor as any}
      />
    );
  }

  return (
    <EmployeeView
      date={state.date}
      setDate={state.setDate}
      attendanceStats={state.attendanceStats}
      todayAttendance={state.todayAttendance}
      showReportsDialog={state.showReportsDialog}
      setShowReportsDialog={state.setShowReportsDialog}
      reportData={state.reportData}
      reportLoading={state.reportLoading}
      handleViewReports={state.handleViewReports}
      handleExportReport={state.handleExportReport}
      getStatusColor={state.getStatusColor as any}
    />
  );
};

export default Attendance;
