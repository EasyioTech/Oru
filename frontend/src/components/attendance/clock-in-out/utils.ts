import type { LocationData } from './types';

export const getLocation = (): Promise<LocationData> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 0, lng: 0, address: 'Location unavailable (browser not supported)', accuracy: 0 });
      return;
    }

    const options: PositionOptions = { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 };

    const successCallback = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'Oru/1.0' } }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.display_name) {
            address = data.display_name.split(',').slice(0, 3).join(',').trim();
          }
        }
      } catch { /* reverse geocoding failed, use coordinates */ }
      resolve({ lat: latitude, lng: longitude, address, accuracy });
    };

    const errorCallback = (error: GeolocationPositionError) => {
      const msgs: Record<number, string> = {
        [error.PERMISSION_DENIED]: 'Location permission denied',
        [error.POSITION_UNAVAILABLE]: 'Location unavailable',
        [error.TIMEOUT]: 'Location timeout',
      };
      resolve({ lat: 0, lng: 0, address: msgs[error.code] ?? 'Location unavailable', accuracy: 0 });
    };

    if (navigator.permissions?.query) {
      let resolved = false;
      const resolveOnce = (v: LocationData) => { if (!resolved) { resolved = true; resolve(v); } };

      navigator.permissions.query({ name: 'geolocation' })
        .then((perm) => {
          if (perm.state === 'denied') { resolveOnce({ lat: 0, lng: 0, address: 'Location permission denied', accuracy: 0 }); return; }
          navigator.geolocation.getCurrentPosition(
            (pos) => { successCallback(pos).catch(() => resolveOnce({ lat: 0, lng: 0, address: 'Location unavailable', accuracy: 0 })); },
            (err) => { if (!resolved) errorCallback(err); },
            options
          );
          perm.onchange = () => { if (perm.state === 'denied') resolveOnce({ lat: 0, lng: 0, address: 'Location permission denied', accuracy: 0 }); };
        })
        .catch(() => { if (!resolved) navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options); });
    } else {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    }
  });
};

export function calculateHours(checkInTime: string, checkOutTime: string): number {
  const diffMs = new Date(checkOutTime).getTime() - new Date(checkInTime).getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

export function isLateClockIn(checkInTime: string, workingHoursStart?: string): boolean {
  if (!workingHoursStart) return false;
  const [hours, minutes] = workingHoursStart.split(':').map(Number);
  const workingStart = new Date();
  workingStart.setHours(hours, minutes, 0, 0);
  const checkIn = new Date(checkInTime);
  checkIn.setSeconds(0, 0);
  return checkIn > workingStart;
}

export function calculateOvertime(totalHours: number, workingHoursStart?: string, workingHoursEnd?: string): number {
  if (!workingHoursStart || !workingHoursEnd) {
    return totalHours > 9 ? Math.round((totalHours - 9) * 100) / 100 : 0;
  }
  const [sh, sm] = workingHoursStart.split(':').map(Number);
  const [eh, em] = workingHoursEnd.split(':').map(Number);
  const standardHours = (eh + em / 60) - (sh + sm / 60);
  return totalHours > standardHours ? Math.round((totalHours - standardHours) * 100) / 100 : 0;
}

export function getElapsedTime(checkInTime: string): string {
  const diffMs = Date.now() - new Date(checkInTime).getTime();
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diffMs % (1000 * 60)) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
