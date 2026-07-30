import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { AppRole } from '@/utils/roleUtils';
import { selectRecords, selectOne } from '@/services/api/core';
import { loginUser, registerUser, loginSauth } from '@/services/api/auth';
import { logWarn, logError } from '@/utils/consoleLogger';

interface User {
  id: string;
  email: string;
  email_confirmed: boolean;
  is_active: boolean;
}

interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: User;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  hire_date: string | null;
  avatar_url: string | null;
  is_active: boolean;
  agency_id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: AppRole | null;
  loading: boolean;
  isSystemSuperAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, domain?: string) => Promise<{ error: any }>;
  signInSauth: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                       = useState<User | null>(null);
  const [session, setSession]                 = useState<Session | null>(null);
  const [profile, setProfile]                 = useState<Profile | null>(null);
  const [userRole, setUserRole]               = useState<AppRole | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [isSystemSuperAdmin, setIsSystemSuperAdmin] = useState(false);

  // ── Token validation ────────────────────────────────────────────────────────
  const isValidTokenFormat = (token: string): boolean => {
    if (!token || typeof token !== 'string' || token.length < 10) return false;
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(token) || (token.includes('.') && token.split('.').length === 3);
  };

  // ── Profile & role hydration ────────────────────────────────────────────────
  const fetchUserProfile = async (userId: string) => {
    try {
      const currentRole = localStorage.getItem('user_role');
      if (currentRole === 'super_admin') return;
      const data = await selectOne('profiles', { user_id: userId });
      if (data) setProfile(data as Profile);
    } catch (error) {
      logError('Error fetching profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const data = await selectRecords('user_roles', { where: { user_id: userId } });
      if (!data || data.length === 0) { setUserRole('employee'); return; }
      const roleHierarchy: Record<AppRole, number> = {
        'super_admin': 1, 'agency_admin': 2, 'manager': 3,
        'employee': 4, 'auditor': 5, 'viewer': 6, 'custom': 7,
      };
      const userRoles = (data as any[]).map(r => (r as { role: AppRole }).role);
      const highestRole = userRoles.reduce((highest, current) => {
        return (roleHierarchy[current] || 99) < (roleHierarchy[highest] || 99) ? current : highest;
      });
      setUserRole(highestRole);
    } catch (error) {
      logError('Error fetching user role:', error);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchUserProfile(user.id);
  };

  // ── Auth actions ────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      let agencyId: string | null = null;
      if (profile?.agency_id) {
        agencyId = profile.agency_id;
      } else if (typeof window !== 'undefined') {
        agencyId = localStorage.getItem('agency_id') || null;
      }
      if (!agencyId) throw new Error('Agency ID not found.');

      const result = await registerUser({ email, password, fullName, agencyId });
      localStorage.setItem('auth_token', result.token);
      setUser(result.user as any as User);
      toast({ title: 'Sign up successful', description: 'Welcome to Oru!' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Sign up failed', description: (error as Error).message, variant: 'destructive' });
      return { error };
    }
  };

  const signIn = async (email: string, password: string, domain?: string) => {
    try {
      const result = await loginUser({ email, password, domain });

      // Persist auth state
      localStorage.setItem('auth_token', result.token);
      const emailConfirmed = (result.user as Record<string, any>).email_confirmed;
      localStorage.setItem('email_confirmed', String(emailConfirmed === true));

      setUser(result.user as any as User);

      // Determine if this is a system-level super admin
      const serverRoles = ((result.user as Record<string, any>).roles || []) as Array<{ role: AppRole } | AppRole>;
      const hasSuperAdminRole = serverRoles.some((r: any) => {
        const role = typeof r === 'string' ? r : (r as { role: AppRole }).role;
        return role === 'super_admin';
      });
      const userAgency = (result.user as Record<string, any>).agency as Record<string, any> | undefined;
      const hasAgencyDatabase = !!(userAgency && userAgency.databaseName);
      const isSystemLevelSuperAdmin = hasSuperAdminRole && !hasAgencyDatabase;
      setIsSystemSuperAdmin(isSystemLevelSuperAdmin);

      if (isSystemLevelSuperAdmin) {
        localStorage.removeItem('agency_database');
        localStorage.removeItem('agency_id');
      } else if (userAgency) {
        if (userAgency.databaseName) localStorage.setItem('agency_database', userAgency.databaseName as string);
        if (userAgency.id)           localStorage.setItem('agency_id',       userAgency.id as string);
      }

      // Profile
      const serverProfile = (result.user as Record<string, any>).profile;
      if (serverProfile) {
        setProfile(serverProfile as any as Profile);
      } else if (!isSystemLevelSuperAdmin) {
        fetchUserProfile(result.user.id);
      } else {
        setProfile(null);
      }

      // Roles
      if (serverRoles.length > 0) {
        const roleHierarchy: Record<AppRole, number> = {
          'super_admin': 1, 'agency_admin': 2, 'manager': 3,
          'employee': 4, 'auditor': 5, 'viewer': 6, 'custom': 7,
        };
        const roleArray = serverRoles.map(r => typeof r === 'string' ? r : (r as { role: AppRole }).role);
        const highestRole = roleArray.reduce((highest, current) => {
          return (roleHierarchy[current] || 99) < (roleHierarchy[highest] || 99) ? current : highest;
        });
        setUserRole(highestRole);
        localStorage.setItem('user_role', highestRole);
      } else {
        fetchUserRole(result.user.id);
      }

      toast({ title: 'Login successful', description: 'Welcome back!' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Login failed', description: (error as Error).message, variant: 'destructive' });
      return { error };
    }
  };

  const signInSauth = async (email: string, password: string) => {
    try {
      const result = await loginSauth({ email, password });
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('email_confirmed', 'true');
      setUser(result.user as any as User);
      setIsSystemSuperAdmin(true);
      localStorage.removeItem('agency_database');
      localStorage.removeItem('agency_id');
      setProfile(null);
      setUserRole('super_admin');
      localStorage.setItem('user_role', 'super_admin');
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      ['auth_token', 'user_role', 'agency_id', 'agency_database', 'email_confirmed'].forEach(k =>
        localStorage.removeItem(k)
      );
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      setIsSystemSuperAdmin(false);
      toast({ title: 'Logged out', description: 'You have been logged out successfully' });
    } catch (error: any) {
      toast({ title: 'Logout failed', description: (error as Error).message, variant: 'destructive' });
    }
  };

  // ── Session restore on mount ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      if (!isValidTokenFormat(token)) {
        logWarn('[Auth] Invalid token format detected, clearing corrupted token');
        ['auth_token', 'agency_database', 'agency_id'].forEach(k => localStorage.removeItem(k));
        setLoading(false);
        return;
      }
      try {
        let decoded: { id?: string; userId?: string; email?: string; exp?: number };
        if (token.includes('.')) {
          const parts = token.split('.');
          if (parts.length !== 3) throw new Error('Invalid JWT format');
          decoded = JSON.parse(atob(parts[1]));
        } else {
          decoded = JSON.parse(atob(token));
        }

        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          const restoredUser: User = {
            id: decoded.id || decoded.userId || '',
            email: decoded.email || '',
            // Read persisted value — never blindly default to true
            email_confirmed: localStorage.getItem('email_confirmed') === 'true',
            is_active: true,
          };
          setUser(restoredUser);

          const storedRole = localStorage.getItem('user_role') as AppRole | null;
          if (storedRole) {
            setUserRole(storedRole);
            if (storedRole === 'super_admin' && !localStorage.getItem('agency_database')) {
              setIsSystemSuperAdmin(true);
            }
          } else if (decoded.id || decoded.userId) {
            const actualId = decoded.id || decoded.userId || '';
            fetchUserProfile(actualId);
            fetchUserRole(actualId);
          }
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        logWarn('[Auth] Failed to decode token, clearing corrupted token:', error);
        ['auth_token', 'agency_database', 'agency_id', 'user_role'].forEach(k => localStorage.removeItem(k));
      }
    }
    setLoading(false);
  }, []);

  const value = useMemo(() => ({
    user, session, profile, userRole, loading, isSystemSuperAdmin,
    signUp, signIn, signInSauth, signOut, refreshProfile,
  }), [user, session, profile, userRole, loading, isSystemSuperAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
