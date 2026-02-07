/**
 * Attendance reports dialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download } from "lucide-react";

interface ReportRecord {
  id?: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  total_hours?: number | string;
  status?: string;
}

interface ReportData {
  startDate: string;
  endDate: string;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  totalHours: string;
  avgHours: string;
  attendanceData: ReportRecord[];
}

interface AttendanceReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: ReportData | null;
  reportLoading: boolean;
  onExport: () => void;
  getStatusColor: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}

export function AttendanceReportsDialog({
  open,
  onOpenChange,
  reportData,
  reportLoading,
  onExport,
  getStatusColor,
}: AttendanceReportsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Report</DialogTitle>
          <DialogDescription>
            {reportData ? `Report for ${reportData.startDate} to ${reportData.endDate}` : 'Loading report data...'}
          </DialogDescription>
        </DialogHeader>

        {reportLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Generating report...</span>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold mt-2">{reportData.totalRecords}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold mt-2">{reportData.presentCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold mt-2">{reportData.lateCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Avg Hours</p>
                    <p className="text-2xl font-bold mt-2">{reportData.avgHours}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={onExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Check In</th>
                      <th className="px-4 py-2 text-left font-medium">Check Out</th>
                      <th className="px-4 py-2 text-left font-medium">Hours</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.attendanceData.slice(0, 50).map((record, idx) => {
                      const totalHours = record.total_hours != null
                        ? (typeof record.total_hours === 'string' ? parseFloat(record.total_hours) : Number(record.total_hours))
                        : 0;
                      const hours = !isNaN(totalHours) && totalHours > 0 ? totalHours.toFixed(1) : '0.0';
                      const checkIn = record.check_in_time
                        ? new Date(record.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '-';
                      const checkOut = record.check_out_time
                        ? new Date(record.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '-';
                      return (
                        <tr key={record.id || idx} className="border-t">
                          <td className="px-4 py-2">{record.date}</td>
                          <td className="px-4 py-2">{checkIn}</td>
                          <td className="px-4 py-2">{checkOut}</td>
                          <td className="px-4 py-2">{hours}</td>
                          <td className="px-4 py-2">
                            <Badge variant={getStatusColor(record.status || 'present')}>
                              {record.status || 'present'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {reportData.attendanceData.length > 50 && (
                <div className="px-4 py-2 text-sm text-muted-foreground text-center border-t">
                  Showing first 50 of {reportData.attendanceData.length} records. Export CSV for full report.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
