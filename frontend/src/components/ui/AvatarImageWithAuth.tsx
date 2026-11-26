/**
 * AvatarImage that fetches API URLs with auth token.
 * Regular img src does not send Authorization header, so API avatar URLs fail.
 * This component fetches with the token and displays via blob URL.
 */
import * as React from 'react';
import { AvatarImage } from '@/components/ui/avatar';
import { getApiRoot, getApiBaseUrl } from '@/config/api';

function normalizeAvatarUrl(src: string): string {
  if (!src) return '';
  if (src.includes('subdomain.yourdomain.com') || src.includes('yourdomain.com')) {
    const parts = src.split('yourdomain.com/');
    const key = parts[1] || src.replace(/^https?:\/\/[^\/]+\//, '');
    return `/api/storage/files/${key}`;
  }
  return src;
}

function isApiAvatarUrl(src: string | undefined): boolean {
  if (!src || typeof src !== 'string') return false;
  const normalized = normalizeAvatarUrl(src);
  const apiRoot = getApiRoot().replace(/\/$/, '');
  return (
    normalized.startsWith(apiRoot) ||
    normalized.includes('/api/files/') ||
    normalized.includes('/api/storage/files/') ||
    normalized.includes('/storage/files/') ||
    normalized.includes('/files/') ||
    (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('data:'))
  );
}

/** Resolve relative API URLs to absolute so fetch hits the correct backend. */
function toAbsoluteApiUrl(src: string): string {
  const normalized = normalizeAvatarUrl(src);
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized;
  }
  const base = getApiBaseUrl();
  return normalized.startsWith('/') ? `${base}${normalized}` : `${base}/${normalized}`;
}

interface AvatarImageWithAuthProps extends React.ComponentPropsWithoutRef<typeof AvatarImage> {
  src?: string | null;
}

export const AvatarImageWithAuth = React.forwardRef<
  React.ElementRef<typeof AvatarImage>,
  AvatarImageWithAuthProps
>(({ src, ...props }, ref) => {
  const [resolvedSrc, setResolvedSrc] = React.useState<string | undefined>(undefined);
  const blobUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!src) {
      setResolvedSrc(undefined);
      return;
    }
    const cleanSrc = normalizeAvatarUrl(src);
    // Data URLs work directly
    if (cleanSrc.startsWith('data:')) {
      setResolvedSrc(cleanSrc);
      return;
    }

    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    const fetchUrl = toAbsoluteApiUrl(cleanSrc);
    let cancelled = false;

    fetch(fetchUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'same-origin',
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) {
          if (!cancelled) setResolvedSrc(fetchUrl);
          return;
        }
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setResolvedSrc(url);
      })
      .catch(() => {
        if (!cancelled) setResolvedSrc(fetchUrl);
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  return <AvatarImage ref={ref} src={resolvedSrc || undefined} {...props} />;
});
AvatarImageWithAuth.displayName = 'AvatarImageWithAuth';
