export interface AuditLog {
  id: string;
  agencyId: string | null;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  changes: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  description: string | null;
  isPublic: boolean;
  updatedBy: string | null;
  updatedAt: Date;
}

export interface PlatformMetrics {
  totalAgencies: number;
  activeAgencies: number;
  totalUsers: number;
  totalRevenue: number;
  agenciesByPlan: Record<string, number>;
  recentSignups: number;
}

export interface AdminAuditLogQuery {
  agencyId?: string;
  userId?: string;
  resourceType?: string;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
