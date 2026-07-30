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

type Color = 'lime' | 'teal' | 'pink' | 'sky' | 'purple';

const COLOR_MAP: Record<Color, { card: string; text: string; icon: string; dot: string }> = {
  lime:   { card: 'bg-lime-100 dark:bg-lime-500/10',   text: 'text-lime-800 dark:text-lime-400',   icon: 'text-lime-700 dark:text-lime-400',   dot: 'bg-lime-500' },
  teal:   { card: 'bg-teal-100 dark:bg-teal-500/10',   text: 'text-teal-800 dark:text-teal-400',   icon: 'text-teal-700 dark:text-teal-400',   dot: 'bg-teal-500' },
  pink:   { card: 'bg-pink-100 dark:bg-pink-500/10',   text: 'text-pink-800 dark:text-pink-400',   icon: 'text-pink-700 dark:text-pink-400',   dot: 'bg-pink-500' },
  sky:    { card: 'bg-sky-100 dark:bg-sky-500/10',     text: 'text-sky-800 dark:text-sky-400',     icon: 'text-sky-700 dark:text-sky-400',     dot: 'bg-sky-500' },
  purple: { card: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-800 dark:text-purple-400', icon: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
};

type CardVariant = 'users' | 'projects' | 'revenue' | 'invoices';

const DomainStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'sky',
  variant,
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  color?: Color;
  variant: CardVariant;
  onClick?: () => void;
}) => {
  const c = COLOR_MAP[color];

  // Specific micro-illustrations based on the domain variant
  const renderBackground = () => {
    switch (variant) {
      case 'users':
        return (
          <svg className="absolute right-0 bottom-0 w-32 h-32 text-current opacity-[0.03] transform translate-x-4 translate-y-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="8" r="5" />
            <path d="M3 21v-2a7 7 0 0 1 14 0v2" />
            <circle cx="19" cy="8" r="4" />
            <path d="M15 21v-2a5 5 0 0 1 6 0v2" />
          </svg>
        );
      case 'projects':
        return (
          <svg className="absolute right-0 bottom-0 w-32 h-32 text-current opacity-[0.03] transform translate-x-2 translate-y-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 3v18M16 3v18M3 9h18M3 15h18" />
          </svg>
        );
      case 'revenue':
        return (
          <svg className="absolute right-0 bottom-0 w-full h-16 text-current opacity-[0.06] transform translate-y-4" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="0.5" preserveAspectRatio="none">
            <path d="M0 24 Q 10 10 20 15 T 40 10 T 60 18 T 80 5 T 100 12 L 100 24 Z" fill="currentColor" opacity="0.5" stroke="none" />
            <path d="M0 24 Q 10 10 20 15 T 40 10 T 60 18 T 80 5 T 100 12" />
          </svg>
        );
      case 'invoices':
        return (
          <svg className="absolute right-0 bottom-0 w-28 h-28 text-current opacity-[0.04] transform translate-x-4 translate-y-6 rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'group relative rounded-2xl border border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden',
        c.card,
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      {/* Abstract Domain Background */}
      <div className={cn("absolute inset-0 pointer-events-none transition-transform duration-500 group-hover:scale-105", c.text)}>
        {renderBackground()}
      </div>
      
      {/* Subtle Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md bg-background/40 backdrop-blur-sm", c.text)}>
              <Icon className="w-4 h-4" strokeWidth={2} />
            </div>
            <span className={cn("text-sm font-semibold tracking-wide uppercase opacity-80", c.text)}>{title}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className={cn("text-3xl font-display font-bold tracking-tight", c.text)}>{value}</div>
          <div className="flex items-center justify-between mt-1">
            {subtitle && <div className={cn("text-xs font-medium opacity-70", c.text)}>{subtitle}</div>}
            
            {trend && (
              <div className="flex items-center gap-1 bg-background/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <span className={cn("text-xs font-bold", c.text)}>{trend}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {onClick && (
        <ArrowRight className={cn("absolute top-5 right-5 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300", c.text)} />
      )}
    </motion.div>
  );
};

const PremiumQuickActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  color = 'sky',
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
  
  // Extracting border color from c.dot (e.g. 'bg-sky-500' -> 'border-sky-500/50')
  const glowBorder = c.dot.replace('bg-', 'border-') + '/50';
  const glowShadow = c.dot.replace('bg-', 'shadow-') + '/20';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(href)}
      className={cn(
        'group relative rounded-xl border bg-card p-5 transition-all duration-300 cursor-pointer overflow-hidden',
        `hover:${glowBorder} hover:shadow-lg hover:${glowShadow} hover:-translate-y-0.5`
      )}
    >
      {/* Hover Background Accent */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none", c.dot)} />
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-2">
          <div className={cn("p-2.5 rounded-full transition-colors duration-300", c.card, "group-hover:bg-transparent")}>
            <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", c.text)} />
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">{title}</h3>
              {badge && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{badge}</Badge>
              )}
            </div>
            <p className="text-xs mt-1 leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 mt-2" />
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
    { title: 'Manage Team', description: 'Add, edit, and manage team members', icon: Users, href: '/employees', color: 'sky' as Color },
    { title: 'Projects', description: 'Track and manage all projects', icon: FolderKanban, href: '/projects', color: 'purple' as Color },
    { title: 'Financial Management', description: 'Invoices, expenses, and revenue', icon: DollarSign, href: '/financial-management', color: 'lime' as Color },
    { title: 'CRM & Clients', description: 'Manage client relationships', icon: Briefcase, href: '/crm', color: 'pink' as Color },
    { title: 'Reports', description: 'View detailed reports and insights', icon: BarChart3, href: '/reports', color: 'teal' as Color },
    { title: 'Settings', description: 'Configure agency settings', icon: Settings, href: '/settings', color: 'sky' as Color },
    { title: 'Calendar & Events', description: 'Manage events and holidays', icon: Calendar, href: '/calendar', color: 'purple' as Color },
    { title: 'Attendance', description: 'Track team attendance records', icon: Clock, href: '/attendance', color: 'lime' as Color },
  ];

  const agencyName = agency?.name || (profile as any)?.agency_name || 'Your Agency';
  const agencyPlan = agency?.subscriptionPlan;
  const monthlyTrend = metrics.totalRevenue > 0 && metrics.monthlyRevenue > 0
    ? `${Math.round((metrics.monthlyRevenue / metrics.totalRevenue) * 100)}% of total`
    : undefined;

  return (
    <div className="w-full min-h-full bg-background antialiased overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="relative w-full h-full">
          <GridPattern />
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
                  <Badge variant="secondary" className="capitalize gap-1 px-2.5 py-0.5 rounded-md font-medium text-xs">
                    <Crown className="w-3.5 h-3.5" />
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
                Welcome back, {(profile as any)?.first_name || user?.email?.split('@')[0] || 'Admin'} — here's your agency overview
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
            <DomainStatCard
              title="Total Users"
              value={metrics.totalUsers}
              subtitle={`${metrics.activeUsers} active`}
              icon={Users}
              color="sky"
              variant="users"
              onClick={() => navigate('/employees')}
            />
            <DomainStatCard
              title="Projects"
              value={metrics.totalProjects}
              subtitle={`${metrics.activeProjects} active`}
              icon={Building}
              color="purple"
              variant="projects"
              onClick={() => navigate('/projects')}
            />
            <DomainStatCard
              title="Total Revenue"
              value={`$${metrics.totalRevenue.toLocaleString()}`}
              subtitle={`$${metrics.monthlyRevenue.toLocaleString()} this month`}
              icon={DollarSign}
              color="lime"
              variant="revenue"
              trend={monthlyTrend}
              onClick={() => navigate('/financial-management')}
            />
            <DomainStatCard
              title="Invoices"
              value={metrics.totalInvoices}
              subtitle={`${metrics.totalClients} clients`}
              icon={FileText}
              color="pink"
              variant="invoices"
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
              <PremiumQuickActionCard key={action.href} {...action} />
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
                  { label: 'New Users', sub: 'Added to your agency', value: metrics.recentActivity.newUsers, icon: UserPlus, color: 'sky' as Color },
                  { label: 'New Projects', sub: 'Created this month', value: metrics.recentActivity.newProjects, icon: FolderKanban, color: 'purple' as Color },
                  { label: 'New Invoices', sub: 'Generated this month', value: metrics.recentActivity.newInvoices, icon: FileText, color: 'lime' as Color },
                ].map((item) => {
                  const c = COLOR_MAP[item.color];
                  return (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', c.card)}>
                        <item.icon className={cn('w-4 h-4', c.icon)} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.sub}</div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-foreground">{item.value}</div>
                  </div>
                )})}
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
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-md', agency?.isActive ? 'bg-emerald-500/10' : 'bg-yellow-500/10')}>
                    <CheckCircle2 className={cn('w-5 h-5', agency?.isActive ? 'text-emerald-500' : 'text-yellow-500')} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {agency?.isActive ? 'Agency Active' : 'Agency Inactive'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {agency?.domain ? `${agency.domain}` : 'All systems operational'}
                    </div>
                  </div>
                </div>
                {agency?.maxUsers && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">
                        Users ({metrics.totalUsers}/{agency.maxUsers})
                      </span>
                      <span className="font-medium text-foreground">
                        {Math.round((metrics.totalUsers / agency.maxUsers) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', agency?.isActive ? 'bg-emerald-500' : 'bg-yellow-500')}
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
                    <Badge variant="secondary" className="text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20">
                      {metrics.leaveRequests.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Approved</span>
                    <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20">
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
