import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasRoleOrHigher, getRoleDisplayName } from '@/utils/roleUtils';
import { getRoutePermission, canAccessRouteSync } from '@/utils/routePermissions';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppRole } from '@/utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Determine required roles
  let requiredRoles: AppRole[] = [];
  let useAutoDetection = false;

  if (requiredRole) {
    requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  } else {
    useAutoDetection = true;
    const routePermission = getRoutePermission(location.pathname);
    if (routePermission) {
      requiredRoles = routePermission.requiredRoles;
    }
  }

  if (userRole && requiredRoles.length > 0) {
    const hasAccess = useAutoDetection
      ? canAccessRouteSync(userRole, location.pathname)
      : (requiredRoles.includes(userRole) || requiredRoles.some(role => hasRoleOrHigher(userRole, role)));

    if (!hasAccess) {
      const routePermission = getRoutePermission(location.pathname);
      const roleNames = requiredRoles.map(role => getRoleDisplayName(role));
      const roleText = roleNames.length === 1
        ? roleNames[0]
        : roleNames.length === 2
        ? `${roleNames[0]} or ${roleNames[1]}`
        : `${roleNames.slice(0, -1).join(', ')}, or ${roleNames[roleNames.length - 1]}`;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>You don't have permission to access this page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This page requires the <strong>{roleText}</strong> role.
                </p>
                {userRole && (
                  <p className="text-sm text-muted-foreground">
                    Your current role: <strong>{getRoleDisplayName(userRole)}</strong>
                  </p>
                )}
                {routePermission?.description && (
                  <p className="text-sm text-muted-foreground italic">{routePermission.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button variant="default" onClick={() => window.location.href = '/dashboard'} className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
