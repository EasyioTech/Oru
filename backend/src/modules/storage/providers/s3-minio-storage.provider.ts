import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FastifyBaseLogger } from 'fastify';
import { getS3Client } from '../../../infrastructure/s3/index.js';

export interface RetrievedFileStream {
  stream: any;
  contentType?: string;
  contentLength?: number;
  eTag?: string;
  lastModified?: Date;
}

export class S3MinioStorageProvider {
  constructor(private logger?: FastifyBaseLogger) {}

  isConfigured(): boolean {
    return !!(
      process.env.S3_ENDPOINT ||
      process.env.AWS_S3_ENDPOINT ||
      process.env.AWS_S3_BUCKET ||
      process.env.S3_BUCKET
    );
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const { client, bucket, region, endpoint, publicUrl } = await getS3Client();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await client.send(command);

    if (publicUrl) {
      return `${publicUrl.replace(/\/$/, '')}/${key}`;
    }

    return key;
  }

  async getFileStream(key: string): Promise<RetrievedFileStream | null> {
    try {
      const { client, bucket } = await getS3Client();
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await client.send(command);

      return {
        stream: response.Body,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        eTag: response.ETag,
        lastModified: response.LastModified,
      };
    } catch (err: any) {
      if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
        return null;
      }
      this.logger?.warn({ err, key }, 'S3 getFileStream error');
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const { client, bucket } = await getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await client.send(command);
  }

  async signedUrl(key: string, expiresIn = 3600): Promise<string> {
    const { client, bucket } = await getS3Client();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await getSignedUrl(client, command, { expiresIn });
  }
}
