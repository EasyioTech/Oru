import { FastifyBaseLogger } from 'fastify';
import { uploadFileToS3 } from '../../infrastructure/s3/index.js';
import { AppError } from '../../utils/errors.js';
import { nanoid } from 'nanoid';
import { db } from '../../infrastructure/database/index.js';
import { systemSettings } from '../../infrastructure/database/schemas/system.js';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';

export class StorageService {
    constructor(private logger: FastifyBaseLogger) { }

    /**
     * Upload a file to object storage
     * @param file - The multipart file object from fastify-multipart
     * @param context - The context folder (e.g., 'branding', 'avatars')
     * @returns Uploaded file details including URL
     */
    async uploadFile(file: any, context: string = 'general', baseUrl?: string) {
        try {
            // 1. Validate file type/size (basic check)
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new AppError('Invalid file type', 400, 'INVALID_FILE_TYPE');
            }

            // 2. Generate unique key
            // Structure: uploads/{context}/{year}/{month}/{random}-{filename}
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const randomId = nanoid(10);
            const ext = path.extname(file.filename);
            const sanitizedName = path.basename(file.filename, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();

            const key = `uploads/${context}/${year}/${month}/${randomId}-${sanitizedName}${ext}`;

            // 3. Determine Storage Provider
            const [settings] = await db.select().from(systemSettings).limit(1);
            const provider = settings?.fileStorageProvider || 'local';

            let fileUrl: string;

            if (provider === 'local') {
                // Ensure local storage directory exists
                const baseDir = path.join(process.cwd(), 'uploads');
                const targetDir = path.join(baseDir, context, year.toString(), month);

                await fs.promises.mkdir(targetDir, { recursive: true });

                const fileName = `${randomId}-${sanitizedName}${ext}`;
                const filePath = path.join(targetDir, fileName);

                await pipeline(file.file, fs.createWriteStream(filePath));

                // Construct absolute URL
                // Priority:
                // 1. baseUrl passed from request (e.g. http://localhost:5001)
                // 2. process.env.API_URL (stripped of /api suffix)
                // 3. Default fallback
                let urlBase = baseUrl;

                if (!urlBase) {
                    if (process.env.API_URL) {
                        // Remove trailing /api or slash
                        urlBase = process.env.API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
                    } else {
                        urlBase = 'http://localhost:5001';
                    }
                }

                fileUrl = `${urlBase}/uploads/${context}/${year}/${month}/${fileName}`;
            } else {
                fileUrl = await uploadFileToS3(file.file, key, file.mimetype);
            }

            return {
                url: fileUrl,
                key: key,
                mimeType: file.mimetype,
                originalName: file.filename,
            };

        } catch (error) {
            this.logger.error({ error, context: 'StorageService.uploadFile' });
            throw error instanceof AppError ? error : new AppError('File upload failed', 500, 'UPLOAD_FAILED');
        }
    }
}
