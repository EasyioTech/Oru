import crypto from 'crypto';
import path from 'path';
import { FastifyBaseLogger } from 'fastify';
import { S3MinioStorageProvider, LocalDiskStorageProvider, RetrievedFileStream } from './providers/index.js';
import { validateAndSanitizeFile, sanitizeStorageKey } from './security/index.js';
import { db } from '../../infrastructure/database/index.js';
import { systemSettings } from '../../infrastructure/database/schemas/system.js';
import { AppError } from '../../utils/errors.js';

export interface StorageUploadResult {
  url: string;
  key: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
}

export class StorageEngineService {
  private s3Provider: S3MinioStorageProvider;
  private localProvider: LocalDiskStorageProvider;

  constructor(private logger: FastifyBaseLogger) {
    this.s3Provider = new S3MinioStorageProvider(logger);
    this.localProvider = new LocalDiskStorageProvider(logger);
  }

  /**
   * Resolves the configured storage provider (s3/minio vs local).
   */
  async resolveActiveProvider(): Promise<'s3' | 'local'> {
    try {
      const [settings] = await db.select().from(systemSettings).limit(1);
      const provider = settings?.fileStorageProvider;
      if (provider && provider !== 'local' && this.s3Provider.isConfigured()) {
        return 's3';
      }
      if (provider === 'local') {
        return 'local';
      }
    } catch {
      // If db read fails, fallback
    }

    if (this.s3Provider.isConfigured()) {
      return 's3';
    }
    return 'local';
  }

  /**
   * Builds the public HTTP URL for an asset.
   * Priority:
   * 1. Explicit S3 public CDN URL (if configured)
   * 2. Canonical API streaming proxy URL: {baseUrl}/api/storage/files/{key}
   */
  buildPublicFileUrl(key: string, requestBaseUrl?: string): string {
    const s3PublicUrl = process.env.AWS_S3_PUBLIC_URL || process.env.S3_PUBLIC_URL;
    if (s3PublicUrl) {
      return `${s3PublicUrl.replace(/\/$/, '')}/${key}`;
    }

    let origin = requestBaseUrl;
    if (!origin) {
      if (process.env.API_URL) {
        origin = process.env.API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
      } else {
        origin = 'https://oruerp.com';
      }
    }

    return `${origin.replace(/\/$/, '')}/api/storage/files/${key}`;
  }

  /**
   * Uploads, sanitizes, and persists an asset into object storage.
   */
  async uploadFile(
    rawBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    agencyId: string,
    context: string = 'general',
    requestBaseUrl?: string
  ): Promise<StorageUploadResult> {
    // 1. Security & MIME validation + SVG sanitization
    const { sanitizedBuffer, finalMimeType } = validateAndSanitizeFile(
      rawBuffer,
      mimeType,
      context
    );

    // 2. Generate structured, tenant-isolated key
    // Structure: {agencyId}/{context}/{year}/{month}/{uniqueId}-{sanitizedBaseName}.{ext}
    const ext = path.extname(originalFilename || '').toLowerCase() || '.bin';
    const baseName = path
      .basename(originalFilename || 'file', ext)
      .replace(/[^a-z0-9_-]/gi, '_')
      .toLowerCase();
    const uniqueId = crypto.randomUUID().slice(0, 12);
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');

    const key = sanitizeStorageKey(
      `${agencyId || 'system'}/${context}/${year}/${month}/${uniqueId}-${baseName}${ext}`
    );

    // 3. Persist to active provider
    const provider = await this.resolveActiveProvider();
    if (provider === 's3') {
      try {
        await this.s3Provider.upload(key, sanitizedBuffer, finalMimeType);
      } catch (err) {
        this.logger.warn({ err, key }, 'S3 upload failed, falling back to local persistent disk');
        await this.localProvider.upload(key, sanitizedBuffer);
      }
    } else {
      await this.localProvider.upload(key, sanitizedBuffer);
    }

    const publicUrl = this.buildPublicFileUrl(key, requestBaseUrl);

    this.logger.info(
      { key, agencyId, context, size: sanitizedBuffer.length, provider },
      'Asset stored successfully'
    );

    return {
      url: publicUrl,
      key,
      mimeType: finalMimeType,
      originalName: originalFilename,
      sizeBytes: sanitizedBuffer.length,
    };
  }

  /**
   * Retrieves a file stream by storage key.
   * Checks S3/MinIO first, then local disk.
   */
  async getFileStream(rawKey: string): Promise<RetrievedFileStream | null> {
    const key = sanitizeStorageKey(rawKey);

    // Try S3 first if configured
    if (this.s3Provider.isConfigured()) {
      const s3Stream = await this.s3Provider.getFileStream(key);
      if (s3Stream) return s3Stream;
    }

    // Fallback to local persistent disk
    return await this.localProvider.getFileStream(key);
  }

  /**
   * Deletes an asset by key across active storage.
   */
  async deleteFile(rawKey: string): Promise<void> {
    const key = sanitizeStorageKey(rawKey);
    try {
      if (this.s3Provider.isConfigured()) {
        await this.s3Provider.delete(key);
      }
    } catch (e) {
      // Continue to local
    }
    await this.localProvider.delete(key);
  }

  /**
   * Generates a temporary pre-signed download URL.
   */
  async getSignedUrl(rawKey: string, expiresIn = 3600): Promise<string> {
    const key = sanitizeStorageKey(rawKey);
    if (this.s3Provider.isConfigured()) {
      return await this.s3Provider.signedUrl(key, expiresIn);
    }
    return this.buildPublicFileUrl(key);
  }
}
