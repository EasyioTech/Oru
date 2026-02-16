import { FastifyBaseLogger } from 'fastify';
import { uploadFileToS3 } from '../../infrastructure/s3/index.js';
import { AppError } from '../../utils/errors.js';
import { nanoid } from 'nanoid';
import path from 'path';

export class StorageService {
    constructor(private logger: FastifyBaseLogger) { }

    /**
     * Upload a file to object storage
     * @param file - The multipart file object from fastify-multipart
     * @param context - The context folder (e.g., 'branding', 'avatars')
     * @returns Uploaded file details including URL
     */
    async uploadFile(file: any, context: string = 'general') {
        try {
            // 1. Validate file type/size (basic check)
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
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

            // 3. Upload to S3
            // file.file is the stream for fastify-multipart
            const fileUrl = await uploadFileToS3(file.file, key, file.mimetype);

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
