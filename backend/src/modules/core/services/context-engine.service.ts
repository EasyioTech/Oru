import { CapabilityEngine } from './capability-engine.service.js';
import { RecommendationEngine } from './recommendation-engine.service.js';

export interface DashboardContext {
  greeting: { main: string; subtitle: string };
  status: string;
  sections: DashboardSection[];
  needs_setup: boolean;
}

export interface DashboardSection {
  type: 'command_center' | 'workspace_health' | 'module_activity' | 'workspace_progress' | 'recent_activity';
  data: any;
}

export class ContextEngine {
  constructor(
    private capabilityEngine: CapabilityEngine,
    private recommendationEngine: RecommendationEngine,
  ) {}

  buildDashboardContext(profile: any): DashboardContext {
    const days_active = profile.adoption_json?.days_active || 0;
    const engagement = profile.adoption_json?.engagement_score || 0;
    const stage = profile.adoption_json?.stage || 'initializing';

    return {
      greeting: this.generateGreeting(profile),
      status: stage,
      sections: [
        this.buildCommandCenter(profile),
        this.buildWorkspaceHealth(profile),
        this.buildModuleActivity(profile),
        this.buildRecentActivity(profile),
      ],
      needs_setup: days_active < 30 && engagement < 50,
    };
  }

  private generateGreeting(profile: any): { main: string; subtitle: string } {
    const days = profile.adoption_json?.days_active || 0;
    const engagement = profile.adoption_json?.engagement_score || 0;

    if (days < 1) {
      return { main: 'Welcome', subtitle: "Your workspace is ready. Let's complete setup." };
    }
    if (engagement < 30) {
      return { main: 'Good morning', subtitle: "Let's get your workspace productive." };
    }
    return { main: 'Good morning', subtitle: "Here's what's happening in your workspace." };
  }

  private buildCommandCenter(profile: any): DashboardSection {
    const best_action = this.recommendationEngine.getNextBestAction(profile);
    return {
      type: 'command_center',
      data: {
        greeting: this.generateGreeting(profile),
        best_action,
        status_indicators: {
          health_score: profile.health_json?.overall_score || 0,
          team_members: profile.collaboration_json?.members_active || 0,
          modules_active: Object.values(profile.modules_json || {}).filter((m: any) => m.enabled).length,
        },
      },
    };
  }

  private buildWorkspaceHealth(profile: any): DashboardSection {
    return {
      type: 'workspace_health',
      data: {
        score: profile.health_json?.overall_score || 0,
        needs_attention: profile.health_json?.needs_attention || [],
        strengths: profile.health_json?.strengths || [],
        quick_wins: profile.adoption_json?.days_active < 30 ? profile.quick_wins_json : undefined,
      },
    };
  }

  private buildModuleActivity(profile: any): DashboardSection {
    const modules = profile.modules_json || {};
    const active = Object.entries(modules)
      .filter(([_, m]: any) => m.enabled && (m.data_count || 0) > 0)
      .map(([key, m]: any) => ({ module: key, data_count: m.data_count, usage: m.usage_score }))
      .sort((a, b) => (b.usage || 0) - (a.usage || 0))
      .slice(0, 4);

    return {
      type: active.length > 0 ? 'module_activity' : 'workspace_progress',
      data: { modules: active, quick_wins: profile.quick_wins_json },
    };
  }

  private buildRecentActivity(profile: any): DashboardSection {
    return {
      type: 'recent_activity',
      data: { activities: [] },
    };
  }
}
