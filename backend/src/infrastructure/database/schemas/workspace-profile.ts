import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const workspaceProfiles = pgTable('workspace_profiles', {
  workspace_id: uuid('workspace_id').defaultRandom().primaryKey(),
  modules_json: jsonb('modules_json').notNull().default({}),
  collaboration_json: jsonb('collaboration_json').notNull().default({}),
  adoption_json: jsonb('adoption_json').notNull().default({}),
  health_json: jsonb('health_json').notNull().default({}),
  recommendations_json: jsonb('recommendations_json').notNull().default([]),
  quick_wins_json: jsonb('quick_wins_json').notNull().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workspaceActivity = pgTable('workspace_activity', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspace_id: uuid('workspace_id').references(() => workspaceProfiles.workspace_id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull(),
  module: text('module'),
  action: text('action').notNull(),
  metadata_json: jsonb('metadata_json'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

export type WorkspaceProfile = typeof workspaceProfiles.$inferSelect;
export type WorkspaceProfileInsert = typeof workspaceProfiles.$inferInsert;
export type WorkspaceActivity = typeof workspaceActivity.$inferSelect;
export type WorkspaceActivityInsert = typeof workspaceActivity.$inferInsert;

export const workspaceProfileSelectSchema = createSelectSchema(workspaceProfiles);
export const workspaceProfileInsertSchema = createInsertSchema(workspaceProfiles).omit({
  created_at: true,
  updated_at: true,
});
export const workspaceActivitySelectSchema = createSelectSchema(workspaceActivity);
export const workspaceActivityInsertSchema = createInsertSchema(workspaceActivity).omit({ id: true, timestamp: true });
