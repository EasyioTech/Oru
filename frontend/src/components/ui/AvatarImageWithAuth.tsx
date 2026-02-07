/**
 * AvatarImage that fetches API URLs with auth token.
 * Regular img src does not send Authorization header, so API avatar URLs fail.
 * This component fetches with the token and displays via blob URL.
 */
import * as React from 'react';
import { AvatarImage } from '@/components/ui/avatar';
import { getApiRoot, getApiBaseUrl } from '@/config/api';

function isApiAvatarUrl(src: string | undefined): boolean {
  if (!src || typeof src !== 'string') return false;
  const apiRoot = getApiRoot().replace(/\/$/, '');
  return src.startsWith(apiRoot) || src.includes('/api/files/');
}

/** Resolve relative API URLs to absolute so fetch hits the correct backend. */
function toAbsoluteApiUrl(src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  const base = getApiBaseUrl();
  return src.startsWith('/') ? `${base}${src}` : `${base}/${src}`;
}

interface AvatarImageWithAuthProps extends React.ComponentPropsWithoutRef<typeof AvatarImage> {
  src?: string | null;
}

export const AvatarImageWithAuth = React.forwardRef<
  React.ElementRef<typeof AvatarImage>,
  AvatarImageWithAuthProps
>(({ src, ...props }, ref) => {
  const [resolvedSrc, setResolvedSrc] = React.useState<string | undefined>(
    src && !isApiAvatarUrl(src) ? src : undefined
  );

  const blobUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!src) {
      setResolvedSrc(undefined);
      return;
    }
    // Data URLs and non-API URLs work directly
    if (src.startsWith('data:') || !isApiAvatarUrl(src)) {
      setResolvedSrc(src);
      return;
    }
    // Fetch API URL with auth token (use absolute URL so fetch hits correct backend)
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    if (!token) {
      setResolvedSrc(undefined);
      return;
    }
    const fetchUrl = toAbsoluteApiUrl(src);
    let cancelled = false;
    fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'same-origin',
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setResolvedSrc(url);
      })
      .catch(() => setResolvedSrc(undefined));
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
