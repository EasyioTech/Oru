import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { StorageEngineService } from '../../modules/storage/storage-engine.service.js';

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
    const engine = new StorageEngineService(fastify.log);

    const storage: StorageService = {
        upload: async (key: string, buffer: Buffer | any, mimeType: string) => {
            const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
            const provider = await engine.resolveActiveProvider();
            if (provider === 's3') {
                try {
                    await (engine as any).s3Provider.upload(key, buf, mimeType);
                } catch {
                    await (engine as any).localProvider.upload(key, buf);
                }
            } else {
                await (engine as any).localProvider.upload(key, buf);
            }
            return engine.buildPublicFileUrl(key);
        },
        delete: async (key: string) => {
            await engine.deleteFile(key);
        },
        signedUrl: async (key: string, expiresIn = 3600) => {
            return await engine.getSignedUrl(key, expiresIn);
        }
    };

    fastify.decorate('storage', storage);
};

export default fp(storagePlugin, { name: 'storage' });
