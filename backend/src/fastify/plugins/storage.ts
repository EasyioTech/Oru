import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { getS3Client, uploadFileToS3, deleteFileFromS3, getSignedUrlForDownload } from '../../infrastructure/s3/index.js';

export interface StorageService {
    upload(key: string, buffer: Buffer | any, mimeType: string): Promise<string>;
    delete(key: string): Promise<void>;
    signedUrl(key: string, expiresIn?: number): Promise<string>;
}

declare module 'fastify' {
    interface FastifyInstance {
        storage: StorageService;
    }
}

const storagePlugin: FastifyPluginAsync = async (fastify) => {
    try {
        await getS3Client();
        if (!process.env.S3_ENDPOINT) {
            fastify.log.warn('S3_ENDPOINT is not set. Storage might not work correctly if using MinIO locally.');
        }
    } catch (e) {
        fastify.log.error('Failed to initialize S3 client: ' + e);
    }

    const storage: StorageService = {
        upload: async (key, buffer, mimeType) => {
            return await uploadFileToS3(buffer, key, mimeType);
        },
        delete: async (key) => {
            await deleteFileFromS3(key);
        },
        signedUrl: async (key, expiresIn = 3600) => {
            return await getSignedUrlForDownload(key, expiresIn);
        }
    };

    fastify.decorate('storage', storage);
};

export default fp(storagePlugin, { name: 'storage' });
