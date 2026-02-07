/**
 * Attendance details list - employee records for a date
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttendanceRecord } from "./types";

interface AttendanceDetailsListProps {
  records: AttendanceRecord[];
  date: Date | undefined;
  getStatusColor: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}

export function AttendanceDetailsList({ records, date, getStatusColor }: AttendanceDetailsListProps) {
  const dateLabel = date
    ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : "Today's";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{dateLabel} Attendance</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Employee check-in and check-out records for selected date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm sm:text-base text-muted-foreground">No attendance records found for this date.</p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-primary">
                      {record.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm sm:text-base truncate">{record.name}</h4>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                      <span className="whitespace-nowrap">In: {record.checkIn}</span>
                      <span className="whitespace-nowrap">Out: {record.checkOut}</span>
                      <span className="whitespace-nowrap">Hours: {record.hours}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusColor(record.status)} className="flex-shrink-0">
                  {record.status.replace('-', ' ')}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
