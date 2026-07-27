import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '../../utils/errors.js';

// Helper to get dynamic configuration
export const getS3Client = async () => {
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'auto';
    const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || 'oru-erp-files';
    const endpoint = process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

    const client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true
    });

    return { client, bucket, region, endpoint, publicUrl: process.env.AWS_S3_PUBLIC_URL };
};

export const uploadFileToS3 = async (fileStream: any, key: string, mimeType: string) => {
    try {
        const { client, bucket, region, endpoint, publicUrl } = await getS3Client();

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
        if (endpoint && endpoint.includes('r2.cloudflarestorage.com')) {
            // R2 usually doesn't have a standard public S3-style URL without a custom domain or .r2.dev
            // If and only if we don't have a publicUrl, we try to guess or use the endpoint as a base
            return `${endpoint}/${bucket}/${key}`;
        }

        if (endpoint) {
            return `${endpoint}/${bucket}/${key}`;
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

export const ensureBucketExists = async (): Promise<void> => {
  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT;
  if (!endpoint) return; // MinIO not configured — skip silently

  const { client, bucket } = await getS3Client();
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err: any) {
    if (err?.name === 'NoSuchBucket' || err?.$metadata?.httpStatusCode === 404) {
      await client.send(new CreateBucketCommand({ Bucket: bucket }));
      console.log(`[storage] Created bucket: ${bucket}`);
    }
    // Any other error (auth, network) — log and continue, don't crash startup
    else {
      console.warn(`[storage] Could not verify bucket "${bucket}":`, err?.message);
    }
  }
};
