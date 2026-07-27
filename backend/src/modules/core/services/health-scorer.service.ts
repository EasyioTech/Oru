import type { WorkspaceProfile } from '../../../infrastructure/database/schema.js';

export type HealthStatus =
  | 'excellent'
  | 'healthy'
  | 'needs_attention'
  | 'at_risk';

export class HealthScorer {
  calculateHealth(profile: WorkspaceProfile | null): number {
    if (!profile) return 0;

    let score = 100;
    const collab = (profile.collaboration_json || {}) as Record<string, any>;
    const adoption = (profile.adoption_json || {}) as Record<string, any>;

    // Team setup (20 points)
    const membersTotal = collab.members_total || 1;
    if (membersTotal === 1) score -= 20;
    else if (membersTotal < 3) score -= 10;

    // Activity (20 points)
    const engagement = adoption.engagement_score || 0;
    if (engagement < 20) score -= 20;
    else if (engagement < 50) score -= 10;

    // Data in modules (15 points)
    const modules = profile.modules_json || {};
    const hasData = Object.values(modules).some(
      (m: any) => m.enabled && m.data_count > 0
    );
    const daysActive = adoption.days_active || 0;
    if (!hasData && daysActive > 3) score -= 15;

    // Active collaborators (10 points)
    const membersActive = collab.members_active || 0;
    if (membersActive === 0 && daysActive > 7) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  classifyHealth(score: number): HealthStatus {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'healthy';
    if (score >= 40) return 'needs_attention';
    return 'at_risk';
  }

  identifyNeeds(profile: WorkspaceProfile | null): string[] {
    if (!profile) return [];

    const items: string[] = [];
    const modules = (profile.modules_json || {}) as Record<string, any>;
    const collab = (profile.collaboration_json || {}) as Record<string, any>;
    const adoption = (profile.adoption_json || {}) as Record<string, any>;

    if ((collab.members_total || 0) === 1 && adoption.days_active > 3) {
      items.push('team_not_invited');
    }
    if ((adoption.engagement_score || 0) < 30) {
      items.push('low_engagement');
    }
    if (
      Object.values(modules).every((m: any) => !m.enabled) &&
      adoption.days_active > 1
    ) {
      items.push('no_modules_enabled');
    }

    return items;
  }

  identifyStrengths(profile: WorkspaceProfile | null): string[] {
    if (!profile) return [];

    const items: string[] = [];
    const collab = (profile.collaboration_json || {}) as Record<string, any>;
    const adoption = (profile.adoption_json || {}) as Record<string, any>;
    const modules = (profile.modules_json || {}) as Record<string, any>;

    if ((collab.members_total || 0) > 3) {
      items.push('strong_team');
    }
    if ((adoption.engagement_score || 0) > 70) {
      items.push('high_engagement');
    }
    const activeModules = Object.values(modules).filter(
      (m: any) => m.enabled
    ).length;
    if (activeModules > 3) {
      items.push('multi_module_adoption');
    }

    return items;
  }
}
