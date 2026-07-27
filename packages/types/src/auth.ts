export interface JwtPayload {
  id: string;
  email: string;
  agencyId?: string;
  roles: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  agencyId: string;
  roles: string[];
}
