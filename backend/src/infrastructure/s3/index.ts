import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '../../utils/errors.js';

// Load from ENV or Config
// Load from ENV or Config
const region = process.env.AWS_REGION || 'auto';
const bucket = process.env.AWS_S3_BUCKET || 'oru-erp-files';
const endpoint = process.env.AWS_S3_ENDPOINT; // Needed for R2/MinIO
const publicUrl = process.env.AWS_S3_PUBLIC_URL; // Custom domain like https://media.oru.com

export const s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    forcePathStyle: true // Needed for some S3 compatible services
});

export const uploadFileToS3 = async (fileStream: any, key: string, mimeType: string) => {
    try {
        const parallelUploads3 = new Upload({
            client: s3Client,
            params: {
                Bucket: bucket,
                Key: key,
                Body: fileStream,
                ContentType: mimeType,
            },
        });

        await parallelUploads3.done();

        // Return structured URL based on config
        if (publicUrl) {
            return `${publicUrl}/${key}`;
        }
        if (endpoint) {
            // For R2/MinIO without custom domain, we often need signed URLs, but if public read is enabled:
            // return `${endpoint}/${bucket}/${key}`;
            // Safest default for now:
            return `https://${bucket}.${region}.r2.cloudflarestorage.com/${key}`;
        }
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (e) {
        throw new AppError('File upload failed', 500, 'UPLOAD_ERROR');
    }
};

export const deleteFileFromS3 = async (key: string) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        await s3Client.send(command);
    } catch (e) {
        throw new AppError('File deletion failed', 500, 'DELETE_ERROR');
    }
};

export const getSignedUrlForDownload = async (key: string, expiresIn = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (e) {
        throw new AppError('Failed to generate download URL', 500, 'DOWNLOAD_URL_ERROR');
    }
};
