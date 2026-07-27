export interface Recommendation {
  id: string;
  priority: number;
  type: 'action' | 'insight' | 'suggestion';
  label: string;
  description?: string;
  action_url?: string;
  requires?: string[];
  condition?: (profile: any) => boolean;
  impact: 'high' | 'medium' | 'low';
  urgency: 'now' | 'soon' | 'later';
  actionable: boolean | ((profile: any) => boolean);
}

export class RecommendationEngine {
  private recommendations: Recommendation[] = [
    {
      id: 'invite_team',
      priority: 100,
      type: 'action',
      label: 'Invite your first teammate',
      description: 'Working together unlocks collaboration features.',
      action_url: '/settings/team',
      requires: ['workspace_exists'],
      condition: (p) => (p.collaboration_json?.members_total || 0) === 1,
      impact: 'high',
      urgency: 'now',
      actionable: true,
    },
    {
      id: 'add_first_client',
      priority: 90,
      type: 'action',
      label: 'Add your first client',
      description: 'Clients are the starting point for projects and invoicing.',
      action_url: '/crm/clients/new',
      requires: ['crm_enabled'],
      condition: (p) => (p.modules_json?.crm?.enabled && (p.modules_json?.crm?.data_count || 0) === 0),
      impact: 'high',
      urgency: 'now',
      actionable: true,
    },
    {
      id: 'enable_hr_module',
      priority: 45,
      type: 'suggestion',
      label: 'Enable HR module',
      description: 'Manage your team with departments and roles.',
      action_url: '/settings/modules/hr/enable',
      condition: (p) => !p.modules_json?.hr?.enabled && (p.collaboration_json?.members_total || 0) > 3,
      impact: 'medium',
      urgency: 'soon',
      actionable: true,
    },
    {
      id: 'enable_finance_module',
      priority: 40,
      type: 'suggestion',
      label: 'Enable Finance module',
      description: 'Track invoices, payments, and financial reports.',
      action_url: '/settings/modules/finance/enable',
      condition: (p) => !p.modules_json?.finance?.enabled && (p.modules_json?.crm?.data_count || 0) > 0,
      impact: 'medium',
      urgency: 'soon',
      actionable: true,
    },
    {
      id: 'enable_inventory_module',
      priority: 30,
      type: 'suggestion',
      label: 'Enable Inventory module',
      description: 'Manage products, stock, and warehouses.',
      action_url: '/settings/modules/inventory/enable',
      condition: (p) => !p.modules_json?.inventory?.enabled && (p.modules_json?.crm?.enabled),
      impact: 'medium',
      urgency: 'later',
      actionable: true,
    },
  ];

  getActionableRecommendations(profile: any): Recommendation[] {
    return this.recommendations.filter((rec) => {
      if (rec.condition && !rec.condition(profile)) return false;
      if (typeof rec.actionable === 'function') return rec.actionable(profile);
      return rec.actionable;
    });
  }

  getNextBestAction(profile: any): Recommendation | null {
    const actionable = this.getActionableRecommendations(profile);
    if (actionable.length === 0) return null;

    const urgencyWeight = { now: 1000, soon: 100, later: 10 };
    const sorted = actionable.sort(
      (a, b) =>
        (b.priority + (urgencyWeight[b.urgency] || 0)) -
        (a.priority + (urgencyWeight[a.urgency] || 0)),
    );

    return sorted[0] || null;
  }
}
