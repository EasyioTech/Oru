import { Queue, Worker } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { HealthScorer } from './services/health-scorer.service.js';
import { RecommendationEngine } from './services/recommendation-engine.service.js';
import { WorkspaceProfileService } from './services/workspace-profile.service.js';
import { workspaceProfiles } from '../../infrastructure/database/schema.js';

export type CoreJobName = 'recalculate-workspace-profile';

export interface CoreJobData {
  workspaceId: string;
}

export function createCoreQueue(redis: any) {
  return new Queue<CoreJobData>('core', { connection: redis });
}

export function startCoreWorker(redis: any, db: NodePgDatabase<any>) {
  const healthScorer = new HealthScorer();
  const recEngine = new RecommendationEngine();

  return new Worker<CoreJobData>(
    'core',
    async (job) => {
      try {
        switch (job.name as CoreJobName) {
          case 'recalculate-workspace-profile': {
            const { workspaceId } = job.data;
            console.log(`[recalculate-workspace-profile] Computing for workspace: ${workspaceId}`);

            const profileSvc = new WorkspaceProfileService(db, console);
            const profile = await profileSvc.getProfile(workspaceId);
            if (!profile) {
              console.log(`[recalculate-workspace-profile] No profile found for workspace: ${workspaceId}`);
              return;
            }

            const health = healthScorer.calculateHealth(profile);
            const needs = healthScorer.identifyNeeds(profile);
            const strengths = healthScorer.identifyStrengths(profile);
            const recommendations = recEngine.getActionableRecommendations(profile);

            await profileSvc.updateProfile(workspaceId, {
              health_json: {
                overall_score: health,
                needs_attention: needs,
                strengths: strengths,
              },
              recommendations_json: recommendations,
              updated_at: new Date(),
            });

            console.log(`[recalculate-workspace-profile] Updated workspace ${workspaceId} with new health score: ${health}`);
            break;
          }
        }
      } catch (err) {
        console.error(`Error in Core worker:`, err);
        throw err;
      }
    },
    { connection: redis }
  );
}
