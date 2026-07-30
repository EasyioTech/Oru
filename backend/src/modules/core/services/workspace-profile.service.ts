import { eq, and } from 'drizzle-orm';
import { workspaceProfiles, workspaceActivity } from '../../../infrastructure/database/schema.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { FastifyBaseLogger } from 'fastify';
import type { WorkspaceActivity } from '../../../infrastructure/database/schema.js';
import type { WorkspaceProfile, WorkspaceProfileData } from '../types/workspace.js';
import { STARTER_MODULES } from '../config/starter-modules.js';

export class WorkspaceProfileService {
  constructor(
    private db: NodePgDatabase<any> | any,
    private log: FastifyBaseLogger | any
  ) {}

  async getProfile(workspaceId: string): Promise<WorkspaceProfile | null> {
    try {
      const profile = await this.db.query.workspaceProfiles.findFirst({
        where: eq(workspaceProfiles.workspace_id, workspaceId),
      });
      return profile || null;
    } catch (error) {
      this.log.error({ error, workspaceId }, 'Failed to get workspace profile');
      throw error;
    }
  }

  async initializeProfile(
    workspaceId: string,
    agencyId: string
  ): Promise<WorkspaceProfile> {
    try {
      const [profile] = await this.db
        .insert(workspaceProfiles)
        .values({
          workspace_id: workspaceId,
          modules_json: {
            active: [],
            available: [],
            disabled: [],
          },
          collaboration_json: {
            members_count: 1,
            solo: true,
            email_verified: false,
          },
          adoption_json: {
            features_used: [],
            days_active: 0,
            last_action: new Date().toISOString(),
          },
          health_json: {
            score: 100,
            last_updated: new Date().toISOString(),
          },
          recommendations_json: [],
          quick_wins_json: [],
        })
        .returning();

      this.log.info(
        { workspaceId, agencyId },
        'Workspace profile initialized'
      );
      return profile;
    } catch (error) {
      this.log.error(
        { error, workspaceId, agencyId },
        'Failed to initialize workspace profile'
      );
      throw error;
    }
  }

  async updateProfile(
    workspaceId: string,
    data: WorkspaceProfileData
  ): Promise<WorkspaceProfile> {
    try {
      const updateData: any = {
        updated_at: new Date(),
        ...data,
      };

      const [profile] = await this.db
        .update(workspaceProfiles)
        .set(updateData)
        .where(eq(workspaceProfiles.workspace_id, workspaceId))
        .returning();

      this.log.info({ workspaceId }, 'Workspace profile updated');
      return profile;
    } catch (error) {
      this.log.error(
        { error, workspaceId },
        'Failed to update workspace profile'
      );
      throw error;
    }
  }

  async logActivity(
    workspaceId: string,
    userId: string,
    action: string,
    module?: string,
    metadata?: Record<string, any>
  ): Promise<WorkspaceActivity> {
    try {
      const [activity] = await this.db
        .insert(workspaceActivity)
        .values({
          workspace_id: workspaceId,
          user_id: userId,
          module: module || null,
          action,
          metadata_json: metadata || null,
        })
        .returning();

      return activity;
    } catch (error) {
      this.log.error(
        { error, workspaceId, userId, action },
        'Failed to log workspace activity'
      );
      throw error;
    }
  }

  async getRecentActivity(
    workspaceId: string,
    limit: number = 50
  ): Promise<WorkspaceActivity[]> {
    try {
      const activities = await this.db.query.workspaceActivity.findMany({
        where: eq(workspaceActivity.workspace_id, workspaceId),
        limit,
        orderBy: (t: any) => [t.timestamp],
      });
      return activities;
    } catch (error) {
      this.log.error(
        { error, workspaceId },
        'Failed to get workspace activity'
      );
      throw error;
    }
  }

  async createDefaultWorkspace(
    workspaceId: string,
    agencyId: string
  ): Promise<WorkspaceProfile> {
    try {
      const starterModules = STARTER_MODULES.map((module) => ({
        name: module.name,
        enabled: module.enabled,
        createdAt: new Date(),
      }));

      const profile = await this.initializeProfile(workspaceId, agencyId);

      const updated = await this.updateProfile(workspaceId, {
        modules_json: {
          active: starterModules.filter((m) => m.enabled),
          available: STARTER_MODULES,
          disabled: starterModules.filter((m) => !m.enabled),
        },
        adoption_json: {
          featuresUsed: [],
          daysActive: 0,
          lastAction: new Date().toISOString(),
        },
      });

      await this.db
        .insert(workspaceActivity)
        .values({
          workspace_id: workspaceId,
          user_id: agencyId,
          module: null,
          action: 'workspace_created',
          metadata_json: {
            starterModulesEnabled: starterModules
              .filter((m) => m.enabled)
              .map((m) => m.name),
          },
        });

      this.log.info(
        { workspaceId, agencyId, modulesEnabled: starterModules.filter((m) => m.enabled).length },
        'Default workspace created with starter modules'
      );

      return updated;
    } catch (error) {
      this.log.error(
        { error, workspaceId, agencyId },
        'Failed to create default workspace'
      );
      throw error;
    }
  }
}
