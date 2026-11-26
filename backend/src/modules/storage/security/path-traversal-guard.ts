import path from 'path';
import { AppError } from '../../../utils/errors.js';

/**
 * Normalizes and guards storage keys against path traversal attacks.
 * Rejects any keys containing relative directory sequences ('..', '%2e%2e')
 * or control characters.
 */
export function sanitizeStorageKey(rawKey: string): string {
  if (!rawKey || typeof rawKey !== 'string') {
    throw new AppError('Storage key is required', 400, 'INVALID_KEY');
  }

  // Decode URI components if URL encoded
  let decoded = rawKey;
  try {
    decoded = decodeURIComponent(rawKey);
  } catch {
    // If decoding fails, keep raw
  }

  // Reject null bytes or suspicious characters
  if (decoded.includes('\0') || decoded.includes('\\') || decoded.includes('..')) {
    throw new AppError('Illegal characters in storage key', 400, 'SECURITY_VIOLATION');
  }

  // Normalize path using POSIX forward slashes
  const normalized = path.posix.normalize(decoded).replace(/^\/+/, '');

  if (normalized.startsWith('..') || normalized === '') {
    throw new AppError('Invalid storage key trajectory', 400, 'SECURITY_VIOLATION');
  }

  return normalized;
}
