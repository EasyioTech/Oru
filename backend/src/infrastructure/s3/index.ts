import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '../../utils/errors.js';
import { db } from '../database/index.js';
import { systemSettings } from '../database/schemas/system.js';
import { decrypt } from '../../utils/encryption.js';

// Helper to get dynamic configuration
export const getS3Client = async () => {
    // 1. Fetch settings
    const [settings] = await db.select().from(systemSettings).limit(1);

    // 2. Determine Credentials (DB > Env)
    const region = settings?.awsS3Region || process.env.AWS_REGION || 'auto';
    const bucket = settings?.awsS3Bucket || process.env.AWS_S3_BUCKET || 'oru-erp-files';
    const endpoint = settings?.awsS3PublicUrl ? undefined : (process.env.AWS_S3_ENDPOINT); // TODO: DB field for endpoint if different from public URL
    // Note: Schema has awsS3PublicUrl but strictly speaking S3 endpoint (for R2/MinIO) might be different. 
    // For now assuming AWS_S3_ENDPOINT from env is main fallback or we need a DB field for 'endpoint'.
    // Looking at schema: awsS3PublicUrl is for public access. 
    // We might need to add `awsS3Endpoint` to schema later if we want full R2 dynamic config.
    // For now, we'll use env for endpoint if DB doesn't have it (or if we strictly stick to AWS S3).

    const accessKeyId = settings?.awsS3AccessKeyEncrypted
        ? decrypt(settings.awsS3AccessKeyEncrypted)
        : process.env.AWS_ACCESS_KEY_ID || '';

    const secretAccessKey = settings?.awsS3SecretKeyEncrypted
        ? decrypt(settings.awsS3SecretKeyEncrypted)
        : process.env.AWS_SECRET_ACCESS_KEY || '';

    const client = new S3Client({
        region,
        endpoint, // This might need to come from DB for non-AWS providers
        credentials: {
            accessKeyId,
            secretAccessKey
        },
        forcePathStyle: true
    });

    return { client, bucket, region, endpoint, publicUrl: settings?.awsS3PublicUrl || process.env.AWS_S3_PUBLIC_URL };
};

// Deprecated: Access via getS3Client() instead
// keeping for backward compatibility if needed, but it will only use Env vars
export const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'auto',
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    forcePathStyle: true
});

export const uploadFileToS3 = async (fileStream: any, key: string, mimeType: string) => {
    try {
        const { client, bucket, region, publicUrl } = await getS3Client();

        const parallelUploads3 = new Upload({
            client,
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
        // Fallback logic
        if (process.env.AWS_S3_ENDPOINT) {
            return `https://${bucket}.${region}.r2.cloudflarestorage.com/${key}`;
        }
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (e) {
        console.error('S3 Upload Error', e);
        throw new AppError('File upload failed', 500, 'UPLOAD_ERROR');
    }
};

export const deleteFileFromS3 = async (key: string) => {
    try {
        const { client, bucket } = await getS3Client();
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        await client.send(command);
    } catch (e) {
        throw new AppError('File deletion failed', 500, 'DELETE_ERROR');
    }
};

export const getSignedUrlForDownload = async (key: string, expiresIn = 3600) => {
    try {
        const { client, bucket } = await getS3Client();
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        return await getSignedUrl(client, command, { expiresIn });
    } catch (e) {
        throw new AppError('Failed to generate download URL', 500, 'DOWNLOAD_URL_ERROR');
    }
};
