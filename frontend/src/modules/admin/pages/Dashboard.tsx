import { motion } from 'framer-motion';
import { Activity, Users, TrendingUp, Server, Plus, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showToast } from '@/components/shared/MinimalToast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as any },
  },
};

const KPICard = ({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  color: string;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{value}</p>
            {trend && <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ {trend} this month</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>{Icon}</div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      provision: 'Agency provisioning initiated',
      manage: 'Loading user management',
      audit: 'Loading audit log',
      health: 'Fetching system health',
      signout: 'Signing out...',
    };
    showToast(messages[action] || 'Action processing', 'info');
  };

  const kpis = [
    {
      icon: <Users className="h-5 w-5 text-white" />,
      label: 'Total Agencies',
      value: '42',
      trend: '+8',
      color: 'bg-blue-500/10',
    },
    {
      icon: <Activity className="h-5 w-5 text-white" />,
      label: 'Active Users',
      value: '3.2K',
      trend: '+12%',
      color: 'bg-emerald-500/10',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-white" />,
      label: 'Signups Today',
      value: '24',
      trend: '+4',
      color: 'bg-orange-500/10',
    },
    {
      icon: <Server className="h-5 w-5 text-white" />,
      label: 'System Uptime',
      value: '99.98%',
      trend: '⭐ Excellent',
      color: 'bg-purple-500/10',
    },
  ];

  const recentAgencies = [
    { id: 1, name: 'Tech Innovations Inc', users: 12, created: '2 hours ago', status: 'active' },
    { id: 2, name: 'Global Solutions Ltd', users: 28, created: '1 day ago', status: 'active' },
    { id: 3, name: 'Creative Studios', users: 8, created: '2 days ago', status: 'pending' },
    { id: 4, name: 'Enterprise Corp', users: 45, created: '3 days ago', status: 'active' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">System Control Plane</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage agencies, users, and platform settings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button size="sm" className="gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              New Agency
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* KPIs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Recent Agencies */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardHeader>
                <CardTitle className="text-lg">Recent Agencies</CardTitle>
                <CardDescription>Newly provisioned workspaces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAgencies.map((agency) => (
                    <motion.div
                      key={agency.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 dark:text-white">{agency.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {agency.users} users • {agency.created}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            agency.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          {agency.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-zinc-200 dark:border-zinc-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => handleAction('provision')}
                >
                  <Plus className="h-4 w-4" />
                  Provision Agency
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => handleAction('manage')}
                >
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => handleAction('audit')}
                >
                  <Activity className="h-4 w-4" />
                  View Audit Log
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => handleAction('health')}
                >
                  <Server className="h-4 w-4" />
                  System Health
                </Button>
                <hr className="my-3 border-zinc-200 dark:border-zinc-700" />
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleAction('signout')}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
