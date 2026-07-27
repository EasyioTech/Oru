import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2 } from "lucide-react";
import { useMyAttendance } from "@/hooks/useMyAttendance";
import { PageHeader } from "@/components/layout/PageHeader";

export default function MyAttendance() {
  const { records, isLoading, error } = useMyAttendance();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading attendance...</span>
      </div>
    );
  }

  if (error) return <div className="p-6 text-destructive">Error loading attendance</div>;

  return (
    <div className="space-y-5">
      <PageHeader title="My Attendance" description="View your attendance history" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6 flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Records</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your history for the past few days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No attendance records found.</p>
              </div>
            ) : (
              records.map((record, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">In: {record.checkInTime} - Out: {record.checkOutTime || 'Active'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{record.totalHours}h</p>
                    <Badge variant="outline">{record.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}