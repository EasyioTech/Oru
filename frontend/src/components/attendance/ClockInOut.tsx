import { useClockInOut } from './clock-in-out/hooks/useClockInOut';
import { ClockInCompact } from './clock-in-out/ClockInCompact';
import { ClockInFull } from './clock-in-out/ClockInFull';
import type { ClockInOutProps } from './clock-in-out/types';

const ClockInOut = ({ compact = false }: ClockInOutProps) => {
  const props = useClockInOut();
  const shared = {
    currentTime: props.currentTime,
    canClockIn: props.canClockIn,
    canClockOut: props.canClockOut,
    isCompleted: props.isCompleted,
    elapsedTime: props.elapsedTime,
    todayAttendance: props.todayAttendance,
    loading: props.loading,
    fetchingLocation: props.fetchingLocation,
    isOnline: props.isOnline,
    locationStatus: props.locationStatus,
    onClockIn: props.handleClockIn,
    onClockOut: props.handleClockOut,
  };

  return compact ? <ClockInCompact {...shared} /> : <ClockInFull {...shared} />;
};

export default ClockInOut;
