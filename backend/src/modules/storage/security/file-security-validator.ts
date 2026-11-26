import { AppError } from '../../../utils/errors.js';

export const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  // Documents
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  // Office formats
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
]);

export const DEFAULT_MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
export const BRANDING_MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;  // 3MB

/**
 * Validates file MIME type, size, and applies security sanitization.
 */
export function validateAndSanitizeFile(
  buffer: Buffer,
  mimeType: string,
  context: string = 'general'
): { sanitizedBuffer: Buffer; finalMimeType: string } {
  const normalizedMime = (mimeType || 'application/octet-stream').toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw new AppError(
      `File type "${normalizedMime}" is not supported. Please upload an image, PDF, or spreadsheet.`,
      400,
      'UNSUPPORTED_MIME_TYPE'
    );
  }

  const maxSize = context === 'branding' || context === 'avatar'
    ? BRANDING_MAX_FILE_SIZE_BYTES
    : DEFAULT_MAX_FILE_SIZE_BYTES;

  if (buffer.length > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    throw new AppError(
      `File exceeds maximum permitted size of ${maxMb}MB.`,
      400,
      'FILE_TOO_LARGE'
    );
  }

  // Security: Sanitize SVG files to eliminate embedded scripts and XSS vectors
  if (normalizedMime === 'image/svg+xml') {
    const rawSvg = buffer.toString('utf-8');
    const dangerousPatterns = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|onload\s*=|onerror\s*=|onclick\s*=|javascript:|data:text\/html/gi;
    if (dangerousPatterns.test(rawSvg)) {
      const sanitizedSvg = rawSvg.replace(dangerousPatterns, '');
      return {
        sanitizedBuffer: Buffer.from(sanitizedSvg, 'utf-8'),
        finalMimeType: normalizedMime,
      };
    }
  }

  return {
    sanitizedBuffer: buffer,
    finalMimeType: normalizedMime,
  };
}
