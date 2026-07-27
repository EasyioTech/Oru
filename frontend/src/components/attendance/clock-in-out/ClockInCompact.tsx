import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { AttendanceRecord, LocationStatus } from './types';

interface Props {
  currentTime: Date;
  canClockIn: boolean;
  canClockOut: boolean;
  isCompleted: boolean;
  elapsedTime: string | null;
  todayAttendance: AttendanceRecord | null;
  loading: boolean;
  fetchingLocation: boolean;
  isOnline: boolean;
  locationStatus: LocationStatus;
  onClockIn: () => void;
  onClockOut: () => void;
}

export function ClockInCompact({ currentTime, canClockIn, canClockOut, isCompleted, elapsedTime, todayAttendance, loading, fetchingLocation, isOnline, onClockIn, onClockOut }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full"><Clock className="h-5 w-5 text-primary" /></div>
            <div>
              <div className="font-mono font-bold text-xl">{format(currentTime, 'HH:mm:ss')}</div>
              <div className="text-xs text-muted-foreground">{format(currentTime, 'EEEE, MMM dd, yyyy')}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            {canClockOut && (
              <>
                <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Working</Badge>
                <div className="text-sm font-mono text-green-600 font-medium">{elapsedTime}</div>
                <div className="text-xs text-muted-foreground">Since {format(new Date(todayAttendance!.check_in_time!), 'HH:mm')}</div>
              </>
            )}
            {isCompleted && (
              <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Completed ({Number(todayAttendance?.hours_worked || todayAttendance?.total_hours || 0).toFixed(1)}h)</Badge>
            )}
            {canClockIn && <Badge variant="outline" className="text-muted-foreground">Not clocked in</Badge>}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {isOnline
              ? <Badge variant="outline" className="text-green-600 border-green-200"><Wifi className="h-3 w-3 mr-1" />Online</Badge>
              : <Badge variant="outline" className="text-red-600 border-red-200"><WifiOff className="h-3 w-3 mr-1" />Offline</Badge>}
          </div>

          <div className="w-full sm:w-auto">
            {canClockIn && (
              <Button onClick={onClockIn} disabled={loading || !isOnline} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{fetchingLocation ? 'Getting Location...' : 'Clocking In...'}</> : <><Clock className="h-4 w-4 mr-2" />Clock In</>}
              </Button>
            )}
            {canClockOut && (
              <Button onClick={onClockOut} disabled={loading || !isOnline} variant="destructive" className="w-full sm:w-auto">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{fetchingLocation ? 'Getting Location...' : 'Clocking Out...'}</> : <><Clock className="h-4 w-4 mr-2" />Clock Out</>}
              </Button>
            )}
            {isCompleted && (
              <Badge variant="outline" className="text-muted-foreground px-4 py-2"><CheckCircle className="h-4 w-4 mr-2" />Day Complete</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
