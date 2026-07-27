import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceDetailsList } from './AttendanceDetailsList';
import type { AttendanceRecord } from './types';

interface DetailsTabProps {
  records: AttendanceRecord[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  getStatusColor: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}

export function DetailsTab({ records, date, setDate, getStatusColor }: DetailsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <AttendanceDetailsList records={records} date={date} getStatusColor={getStatusColor} />
      </div>
      <div className="w-full">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Calendar</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Select a date to view attendance</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 overflow-visible">
            <div className="w-full flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full max-w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
