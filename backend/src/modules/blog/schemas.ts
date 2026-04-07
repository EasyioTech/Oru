import { z } from 'zod';

export const createBlogPostSchema = z.object({
    title: z.string().min(5),
    slug: z.string().min(3),
    subtitle: z.string().optional(),
    content: z.string().min(10),
    excerpt: z.string().optional(),
    featuredImage: z.string().url().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).default([]),
    relatedFeatureId: z.string().uuid().optional().nullable(),
    isPublished: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    publishedAt: z.string().datetime().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const blogPostResponseSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    subtitle: z.string().nullable().optional(),
    content: z.string(),
    excerpt: z.string().nullable().optional(),
    featuredImage: z.string().nullable().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    seoKeywords: z.array(z.string()),
    relatedFeatureId: z.string().uuid().nullable().optional(),
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
    publishedAt: z.union([z.date(), z.string()]).nullable().optional(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export const listBlogPostsResponseSchema = z.array(blogPostResponseSchema);
