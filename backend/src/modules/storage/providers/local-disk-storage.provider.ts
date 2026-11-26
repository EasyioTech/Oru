import fs from 'fs';
import path from 'path';
import { FastifyBaseLogger } from 'fastify';
import { RetrievedFileStream } from './s3-minio-storage.provider.js';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
};

export class LocalDiskStorageProvider {
  private baseDir: string;

  constructor(private logger?: FastifyBaseLogger) {
    if (process.env.FILE_STORAGE_PATH && path.isAbsolute(process.env.FILE_STORAGE_PATH)) {
      this.baseDir = process.env.FILE_STORAGE_PATH;
    } else {
      this.baseDir = path.join(process.cwd(), 'storage');
    }

    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch (err) {
      this.logger?.warn({ err, baseDir: this.baseDir }, 'Could not initialize local storage dir');
    }
  }

  getBaseDir(): string {
    return this.baseDir;
  }

  private resolvePath(key: string): string {
    return path.join(this.baseDir, key);
  }

  async upload(key: string, buffer: Buffer): Promise<string> {
    const filePath = this.resolvePath(key);
    const dir = path.dirname(filePath);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, buffer);

    return key;
  }

  async getFileStream(key: string): Promise<RetrievedFileStream | null> {
    const filePath = this.resolvePath(key);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const stat = await fs.promises.stat(filePath);
      const stream = fs.createReadStream(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';

      return {
        stream,
        contentType,
        contentLength: stat.size,
        lastModified: stat.mtime,
      };
    } catch (err) {
      this.logger?.warn({ err, key, filePath }, 'LocalDiskStorage getFileStream failed');
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}
