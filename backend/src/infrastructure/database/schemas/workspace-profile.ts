import { pgTable, text, timestamp, json, uuid, bigserial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const workspaceProfiles = pgTable('workspace_profiles', {
  workspace_id: uuid('workspace_id').primaryKey(),
  created_at: timestamp('created_at').default(sql`NOW()`),
  updated_at: timestamp('updated_at').default(sql`NOW()`),

  modules_json: json('modules_json').notNull().default({}),
  collaboration_json: json('collaboration_json').notNull().default({}),
  adoption_json: json('adoption_json').notNull().default({}),
  health_json: json('health_json').notNull().default({}),
  recommendations_json: json('recommendations_json').notNull().default([]),
  quick_wins_json: json('quick_wins_json').notNull().default([]),
});

export const workspaceActivity = pgTable('workspace_activity', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  workspace_id: uuid('workspace_id').references(() => workspaceProfiles.workspace_id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull(),
  module: text('module'),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').default(sql`NOW()`),
  metadata_json: json('metadata_json'),
});

export type WorkspaceProfile = typeof workspaceProfiles.$inferSelect;
export type WorkspaceProfileInsert = typeof workspaceProfiles.$inferInsert;
export type WorkspaceActivity = typeof workspaceActivity.$inferSelect;

export const workspaceProfileSelectSchema = createSelectSchema(workspaceProfiles);
export const workspaceActivityInsertSchema = createInsertSchema(workspaceActivity).omit({
  id: true,
  timestamp: true,
});
