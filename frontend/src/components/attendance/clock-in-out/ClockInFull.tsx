import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, MapPin, Loader2, CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
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

const LOCATION_BADGES: Record<LocationStatus, JSX.Element> = {
  available: <Badge variant="outline" className="text-green-600 border-green-200"><MapPin className="h-3 w-3 mr-1" />Location Ready</Badge>,
  denied: <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="h-3 w-3 mr-1" />Location Denied</Badge>,
  unavailable: <Badge variant="outline" className="text-yellow-600 border-yellow-200"><AlertTriangle className="h-3 w-3 mr-1" />No Location</Badge>,
  checking: <Badge variant="outline" className="text-gray-600"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Checking...</Badge>,
};

export function ClockInFull({ currentTime, canClockIn, canClockOut, isCompleted, elapsedTime, todayAttendance, loading, fetchingLocation, isOnline, locationStatus, onClockIn, onClockOut }: Props) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2"><Clock className="h-6 w-6" />Time Clock</CardTitle>
        <CardDescription>Track your work hours with location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-4xl font-mono font-bold text-primary">{format(currentTime, 'HH:mm:ss')}</div>
          <div className="text-sm text-muted-foreground mt-1">{format(currentTime, 'EEEE, MMMM do, yyyy')}</div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {LOCATION_BADGES[locationStatus]}
          {isOnline
            ? <Badge variant="outline" className="text-green-600 border-green-200"><Wifi className="h-3 w-3 mr-1" />Online</Badge>
            : <Badge variant="outline" className="text-red-600 border-red-200"><WifiOff className="h-3 w-3 mr-1" />Offline</Badge>}
        </div>

        {locationStatus === 'denied' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">Location is disabled. You can still clock in/out, but your location won't be recorded. Enable location in browser settings for accurate tracking.</AlertDescription>
          </Alert>
        )}

        {!isOnline && (
          <Alert className="border-red-200 bg-red-50">
            <WifiOff className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">You're offline. Please check your internet connection to clock in/out.</AlertDescription>
          </Alert>
        )}

        {todayAttendance && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-center">Today's Activity</h4>
            <div className="space-y-2">
              {todayAttendance.check_in_time && (
                <div className="flex justify-between items-center p-2 bg-background rounded">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Clock In</span>
                  <Badge variant="outline" className="font-mono">{format(new Date(todayAttendance.check_in_time), 'HH:mm:ss')}</Badge>
                </div>
              )}
              {todayAttendance.check_out_time && (
                <>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm text-muted-foreground flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" />Clock Out</span>
                    <Badge variant="outline" className="font-mono">{format(new Date(todayAttendance.check_out_time), 'HH:mm:ss')}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-sm text-green-700 font-medium">Total Hours</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 font-mono">{Number(todayAttendance.hours_worked || todayAttendance.total_hours || 0).toFixed(2)}h</Badge>
                  </div>
                  {Number(todayAttendance.overtime_hours || 0) > 0 && (
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                      <span className="text-sm text-blue-700 font-medium">Overtime</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-mono">{Number(todayAttendance.overtime_hours || 0).toFixed(2)}h</Badge>
                    </div>
                  )}
                </>
              )}
              {canClockOut && (
                <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                  <span className="text-sm text-green-700 font-medium">Elapsed Time</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 font-mono">{elapsedTime}</Badge>
                </div>
              )}
              {todayAttendance.location && (
                <div className="flex items-start gap-2 p-2 bg-background rounded text-xs text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="break-all">{todayAttendance.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {canClockIn && (
            <Button onClick={onClockIn} disabled={loading || !isOnline} className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg" size="lg">
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{fetchingLocation ? 'Getting Location...' : 'Clocking In...'}</> : <><Clock className="h-5 w-5 mr-2" />Clock In</>}
            </Button>
          )}
          {canClockOut && (
            <Button onClick={onClockOut} disabled={loading || !isOnline} variant="destructive" className="w-full h-14 text-lg" size="lg">
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{fetchingLocation ? 'Getting Location...' : 'Clocking Out...'}</> : <><Clock className="h-5 w-5 mr-2" />Clock Out</>}
            </Button>
          )}
          {isCompleted && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-green-800 font-medium">Day Complete!</p>
              <p className="text-sm text-green-600">You worked {Number(todayAttendance?.hours_worked || todayAttendance?.total_hours || 0).toFixed(2)} hours today</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
