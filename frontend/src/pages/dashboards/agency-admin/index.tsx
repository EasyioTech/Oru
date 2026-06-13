import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAgencyAnalytics } from '@/hooks/useAgencyAnalytics';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { GridPattern, GlowOrb } from '@/components/landing/fragments';
import {
  Users,
  Building,
  DollarSign,
  FileText,
  Calendar,
  CalendarDays,
  Settings,
  BarChart3,
  Briefcase,
  UserPlus,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Activity,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Color = 'blue' | 'emerald' | 'purple' | 'orange' | 'cyan';

const COLOR_MAP: Record<Color, { bg: string; border: string; icon: string; dot: string }> = {
  blue:    { bg: 'bg-blue-500/8',    border: 'border-blue-500/15',    icon: 'text-blue-500',    dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', icon: 'text-emerald-500', dot: 'bg-emerald-500' },
  purple:  { bg: 'bg-purple-500/8',  border: 'border-purple-500/15',  icon: 'text-purple-500',  dot: 'bg-purple-500' },
  orange:  { bg: 'bg-orange-500/8',  border: 'border-orange-500/15',  icon: 'text-orange-500',  dot: 'bg-orange-500' },
  cyan:    { bg: 'bg-cyan-500/8',    border: 'border-cyan-500/15',    icon: 'text-cyan-500',    dot: 'bg-cyan-500' },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  color?: Color;
  onClick?: () => void;
}) => {
  const c = COLOR_MAP[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-sm',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <Icon className={cn('w-4 h-4', c.icon)} strokeWidth={1.75} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          {subtitle && <div className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{trend}</span>
          )}
          <span className={cn('h-1.5 w-5 rounded-full opacity-50', c.dot)} />
        </div>
      </div>
      {onClick && (
        <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      )}
    </motion.div>
  );
};

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  color = 'blue',
  badge,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color?: Color;
  badge?: string;
}) => {
  const navigate = useNavigate();
  const c = COLOR_MAP[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(href)}
      className={cn(
        'group relative rounded-xl border bg-card p-5 transition-all duration-500 cursor-pointer',
        `hover:${c.border.replace('border-', 'border-')}`,
        'hover:shadow-lg hover:scale-[1.01]',
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('p-2.5 rounded-xl', c.bg)}>
            <Icon className={cn('w-5 h-5', c.icon)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground font-display tracking-tight">{title}</h3>
              {badge && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{badge}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};

const AgencyAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, profile } = useAuth();
  const { agency, metrics, loading, error, refreshMetrics } = useAgencyAnalytics();
  const { toast } = useToast();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  if (userRole === 'super_admin') {
    // Navigate will be handled in the component body
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
      setLastRefresh(new Date());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const handleManualRefresh = () => {
    refreshMetrics();
    setLastRefresh(new Date());
    toast({ title: 'Dashboard Refreshed', description: 'Agency metrics have been updated.' });
  };

  if (userRole === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Error Loading Dashboard</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={handleManualRefresh} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    { title: 'Manage Team', description: 'Add, edit, and manage team members', icon: Users, href: '/employees', color: 'blue' as Color },
    { title: 'Projects', description: 'Track and manage all projects', icon: FolderKanban, href: '/projects', color: 'purple' as Color },
    { title: 'Financial Management', description: 'Invoices, expenses, and revenue', icon: DollarSign, href: '/financial-management', color: 'emerald' as Color },
    { title: 'CRM & Clients', description: 'Manage client relationships', icon: Briefcase, href: '/crm', color: 'orange' as Color },
    { title: 'Reports', description: 'View detailed reports and insights', icon: BarChart3, href: '/reports', color: 'cyan' as Color },
    { title: 'Settings', description: 'Configure agency settings', icon: Settings, href: '/settings', color: 'blue' as Color },
    { title: 'Calendar & Events', description: 'Manage events and holidays', icon: Calendar, href: '/calendar', color: 'purple' as Color },
    { title: 'Attendance', description: 'Track team attendance records', icon: Clock, href: '/attendance', color: 'emerald' as Color },
  ];

  const agencyName = agency?.name || profile?.agency_name || 'Your Agency';
  const agencyPlan = agency?.subscriptionPlan;
  const monthlyTrend = metrics.totalRevenue > 0 && metrics.monthlyRevenue > 0
    ? `${Math.round((metrics.monthlyRevenue / metrics.totalRevenue) * 100)}% of total`
    : undefined;

  return (
    <div className="relative w-full min-h-full bg-background antialiased overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="relative w-full h-full">
          <GridPattern />
          <GlowOrb color="blue" size={300} className="top-[10%] right-[5%] opacity-15" blur={60} />
          <GlowOrb color="emerald" size={250} className="bottom-[10%] right-[5%] opacity-15" blur={60} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />
        </div>
      </div>

      <div className="relative z-10 w-full space-y-6">
        {/* Header */}
        <section className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-1"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-foreground leading-[1.1] tracking-[-0.02em]">
                  {agencyName}
                </h1>
                {agencyPlan && (
                  <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10 text-purple-400 capitalize gap-1">
                    <Crown className="w-3 h-3" />
                    {agencyPlan}
                  </Badge>
                )}
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-sm sm:text-base text-muted-foreground"
              >
                Welcome back, {profile?.first_name || user?.email?.split('@')[0] || 'Admin'} — here's your agency overview
              </motion.p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground hidden sm:block">
                Updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button onClick={handleManualRefresh} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Users"
              value={metrics.totalUsers}
              subtitle={`${metrics.activeUsers} active`}
              icon={Users}
              color="blue"
              onClick={() => navigate('/employees')}
            />
            <StatCard
              title="Projects"
              value={metrics.totalProjects}
              subtitle={`${metrics.activeProjects} active`}
              icon={Building}
              color="purple"
              onClick={() => navigate('/projects')}
            />
            <StatCard
              title="Total Revenue"
              value={`$${metrics.totalRevenue.toLocaleString()}`}
              subtitle={`$${metrics.monthlyRevenue.toLocaleString()} this month`}
              icon={DollarSign}
              color="emerald"
              trend={monthlyTrend}
              onClick={() => navigate('/financial-management')}
            />
            <StatCard
              title="Invoices"
              value={metrics.totalInvoices}
              subtitle={`${metrics.totalClients} clients`}
              icon={FileText}
              color="orange"
              onClick={() => navigate('/financial-management')}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold text-foreground font-display tracking-tight mb-2">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Access all your agency management tools</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <QuickActionCard key={action.href} {...action} />
            ))}
          </div>
        </section>

        {/* Activity & Status */}
        <section className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2 rounded-xl border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground font-display">Recent Activity (30 days)</h3>
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {[
                  { label: 'New Users', sub: 'Added to your agency', value: metrics.recentActivity.newUsers, icon: UserPlus, color: 'bg-blue-500/10', ic: 'text-blue-400' },
                  { label: 'New Projects', sub: 'Created this month', value: metrics.recentActivity.newProjects, icon: FolderKanban, color: 'bg-purple-500/10', ic: 'text-purple-400' },
                  { label: 'New Invoices', sub: 'Generated this month', value: metrics.recentActivity.newInvoices, icon: FileText, color: 'bg-emerald-500/10', ic: 'text-emerald-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', item.color)}>
                        <item.icon className={cn('w-4 h-4', item.ic)} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.sub}</div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              {/* Agency Status */}
              <div className={cn(
                'rounded-xl border p-6',
                agency?.isActive
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : 'border-yellow-500/20 bg-yellow-500/10',
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', agency?.isActive ? 'bg-emerald-500/20' : 'bg-yellow-500/20')}>
                    <CheckCircle2 className={cn('w-5 h-5', agency?.isActive ? 'text-emerald-400' : 'text-yellow-400')} />
                  </div>
                  <div>
                    <div className={cn('text-sm font-semibold', agency?.isActive ? 'text-emerald-400' : 'text-yellow-400')}>
                      {agency?.isActive ? 'Agency Active' : 'Agency Inactive'}
                    </div>
                    <div className={cn('text-xs opacity-80', agency?.isActive ? 'text-emerald-400' : 'text-yellow-400')}>
                      {agency?.domain ? `${agency.domain}` : 'All systems operational'}
                    </div>
                  </div>
                </div>
                {agency?.maxUsers && (
                  <div className="mt-3 pt-3 border-t border-current/10">
                    <div className="flex justify-between text-xs">
                      <span className={cn('opacity-70', agency?.isActive ? 'text-emerald-400' : 'text-yellow-400')}>
                        Users ({metrics.totalUsers}/{agency.maxUsers})
                      </span>
                      <span className={cn('font-medium', agency?.isActive ? 'text-emerald-400' : 'text-yellow-400')}>
                        {Math.round((metrics.totalUsers / agency.maxUsers) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-current/10 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', agency?.isActive ? 'bg-emerald-400' : 'bg-yellow-400')}
                        style={{ width: `${Math.min(100, Math.round((metrics.totalUsers / agency.maxUsers) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Leave Requests */}
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Leave Requests</h3>
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Pending</span>
                    <Badge variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      {metrics.leaveRequests.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Approved</span>
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {metrics.leaveRequests.approved}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-sm font-medium text-foreground">{metrics.leaveRequests.total}</span>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Attendance</h3>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-semibold text-foreground font-display mb-1">{metrics.attendanceRecords}</div>
                <div className="text-xs text-muted-foreground">Total records</div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AgencyAdminDashboard;
