import type { WorkspaceProfile } from '../../../infrastructure/database/schema.js';

export interface ModuleCapability {
  module: string;
  reason: string;
}

export interface Capabilities {
  enabled_modules: string[];
  available_modules: ModuleCapability[];
  features: string[];
}

export class CapabilityEngine {
  getCapabilities(profile: WorkspaceProfile | null): Capabilities {
    if (!profile) {
      return {
        enabled_modules: [],
        available_modules: [],
        features: [],
      };
    }

    // Enabled modules: those with enabled=true
    const modules = profile.modules_json || {};
    const enabled_modules = Object.entries(modules)
      .filter(([_, module]: [string, any]) => module.enabled)
      .map(([key, _]) => key);

    // Available modules: those with suggestion_score > 30 and not enabled
    const available_modules = Object.entries(modules)
      .filter(
        ([_, module]: [string, any]) =>
          !module.enabled && (module.suggestion_score || 0) > 30
      )
      .map(([key, module]: [string, any]) => ({
        module: key,
        reason:
          module.suggestion_reason || 'based_on_your_activity',
      }));

    // Features: derived from enabled modules
    const features = this.deriveFeatures(enabled_modules);

    return {
      enabled_modules,
      available_modules,
      features,
    };
  }

  private deriveFeatures(enabledModules: string[]): string[] {
    const featureMap: Record<string, string[]> = {
      crm: [
        'manage_clients',
        'track_deals',
        'log_activities',
      ],
      projects: [
        'create_projects',
        'assign_tasks',
        'track_progress',
      ],
      hr: [
        'manage_employees',
        'track_attendance',
        'manage_leave',
      ],
      finance: [
        'create_invoices',
        'track_payments',
        'financial_reports',
      ],
      inventory: [
        'manage_products',
        'track_stock',
        'warehouse_management',
      ],
      procurement: [
        'purchase_orders',
        'vendor_management',
        'requisitions',
      ],
      reports: [
        'build_custom_reports',
        'scheduled_exports',
        'analytics',
      ],
    };

    return enabledModules.flatMap((m) => featureMap[m] || []);
  }
}
