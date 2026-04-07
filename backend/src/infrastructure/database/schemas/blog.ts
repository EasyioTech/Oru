import { pgTable, uuid, text, boolean, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';
import { pageCatalog } from './catalog.js';

/**
 * Blog Posts Table
 */
export const blogPosts = pgTable('blog_posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    content: text('content').notNull(), // Markdown or HTML
    excerpt: text('excerpt'),
    featuredImage: text('featured_image'),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    category: text('category').notNull(),
    tags: text('tags').array().default([]),
    
    // SEO Fields
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoKeywords: text('seo_keywords').array(),
    
    // Content Integration
    relatedFeatureId: uuid('related_feature_id').references(() => pageCatalog.id, { onDelete: 'set null' }),
    
    // Status
    isPublished: boolean('is_published').default(false).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    
    // Metadata
    metadata: jsonb('metadata').default({}).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    slugIdx: uniqueIndex('idx_blog_posts_slug').on(table.slug),
    publishedIdx: index('idx_blog_posts_published').on(table.publishedAt).where(sql`is_published = true`),
    categoryIdx: index('idx_blog_posts_category').on(table.category),
    featureIdx: index('idx_blog_posts_feature').on(table.relatedFeatureId),
}));

/**
 * Blog Categories
 */
export const blogCategories = pgTable('blog_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon'),
    displayOrder: timestamp('display_order').defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
