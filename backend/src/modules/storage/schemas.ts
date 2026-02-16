import { z } from 'zod';

export const uploadFileSchema = z.object({
    fileType: z.enum(['image', 'document', 'other']).default('image'),
    context: z.enum(['branding', 'user-avatar', 'agency-logo', 'document', 'ticket', 'other', 'general']).default('general'),
    isPublic: z.boolean().default(true),
});

export type UploadFileRequest = z.infer<typeof uploadFileSchema>;

export const uploadResponseSchema = z.object({
    url: z.string().url(),
    key: z.string(),
    mimeType: z.string(),
    size: z.number(),
    originalName: z.string(),
});
