export interface Agency {
  id: string;
  name: string;
  domain: string | null;
  planId: string | null;
  isActive: boolean;
  logoUrl: string | null;
  primaryColor: string | null;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgencyMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  recentUsers: number;
  recentProjects: number;
}
