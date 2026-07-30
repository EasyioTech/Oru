import type { WorkspaceProfile as DBWorkspaceProfile } from '../../../infrastructure/database/schema.js';

export type WorkspaceProfile = DBWorkspaceProfile;

export interface WorkspaceProfileData {
  modules_json?: Record<string, any>;
  collaboration_json?: Record<string, any>;
  adoption_json?: Record<string, any>;
  health_json?: Record<string, any>;
  recommendations_json?: Array<any>;
  quick_wins_json?: Array<any>;
  updated_at?: Date;
}
