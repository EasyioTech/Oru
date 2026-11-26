import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAgencyAnalytics } from '@/hooks/useAgencyAnalytics';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Star, Plus, Share2, Upload, Settings, Monitor,
  Phone, Linkedin, Check, ChevronDown, Pen, Trash2,
  MessageSquare, Briefcase, Users, Calendar, Activity,
  FileText, Mail, MoreHorizontal, Shield as ShieldIcon,
  RefreshCcw, BarChart3, DownloadCloud, ArrowUpRight,
  CheckCircle2, Clock, Layers, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { FloatingCard, PillButton, NavIconButton, DisplayTitle, MicroLabel } from '@/components/ui/design-tokens';

interface PriorityTask {
  id: string;
  label: string;
  done: boolean;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recent';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

const DEFAULT_PRIORITIES: PriorityTask[] = [
  { id: '1', label: 'Configure agency branding, logo & business settings', done: true },
  { id: '2', label: 'Invite team leads & departmental staff', done: false },
  { id: '3', label: 'Create initial client projects and assign milestones', done: false },
  { id: '4', label: 'Setup attendance policies and leave approval workflows', done: false },
];

const AgencyAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, profile } = useAuth();
  const { agency, metrics, loading, error, refreshMetrics } = useAgencyAnalytics();
  const { toast } = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Persistent key priorities tied to agency
  const storageKey = `oru_agency_priorities_${agency?.id || 'default'}`;
  const [priorities, setPriorities] = useState<PriorityTask[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRIORITIES;
  });

  // Re-sync priorities when agency id resolves
  useEffect(() => {
    if (agency?.id) {
      const saved = localStorage.getItem(`oru_agency_priorities_${agency.id}`);
      if (saved) {
        try {
          setPriorities(JSON.parse(saved));
        } catch {}
      }
    }
  }, [agency?.id]);

  // Persist priorities on change
  const savePriorities = (updated: PriorityTask[]) => {
    setPriorities(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  const toggleTask = (id: string) => {
    const updated = priorities.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    savePriorities(updated);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: PriorityTask = {
      id: Date.now().toString(),
      label: newTaskInput.trim(),
      done: false,
    };
    savePriorities([...priorities, newTask]);
    setNewTaskInput('');
    setShowAddTask(false);
    toast({ title: 'Task added', description: 'Priority task created successfully.' });
  };

  const deleteTask = (id: string) => {
    savePriorities(priorities.filter((t) => t.id !== id));
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMetrics();
      toast({ title: 'Refreshed', description: 'Dashboard metrics updated successfully.' });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (userRole === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  const agencyName = agency?.name || (profile as any)?.agency_name || 'Your Agency';
  const completedPrioritiesCount = priorities.filter((t) => t.done).length;
  const recentActivities = metrics?.recentActivities || [];

  // Calculate dynamic operational score
  const totalUsers = metrics?.totalUsers || 0;
  const totalProjects = metrics?.totalProjects || 0;
  const activeProjects = metrics?.activeProjects || 0;
  const maxSeats = agency?.maxUsers || 25;
  const seatUtilization = Math.min(100, Math.round((totalUsers / maxSeats) * 100));

  let systemHealthScore = 85;
  if (totalUsers > 0) systemHealthScore += 5;
  if (totalProjects > 0) systemHealthScore += 5;
  if (completedPrioritiesCount >= 3) systemHealthScore += 4;
  systemHealthScore = Math.min(99, systemHealthScore);

  return (
    <div className="w-full flex-1 space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* =====================================================================
          EXECUTIVE HERO BANNER (Clean, High-Tech B2B ERP Aesthetic)
          ===================================================================== */}
      <FloatingCard delay={0.05} className="relative overflow-hidden p-0 border border-slate-800/80 shadow-2xl mb-2 rounded-[2rem] bg-slate-950 text-white">
        {/* Subtle Obsidian Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 z-0" />
        
        {/* Ambient Radial Lighting Effects */}
        <div 
          className="absolute inset-0 z-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 10% 40%, rgba(99, 102, 241, 0.4) 0%, transparent 45%),
                              radial-gradient(circle at 85% 20%, rgba(14, 165, 233, 0.3) 0%, transparent 40%),
                              radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)`,
          }}
        />

        {/* Micro-Grid Texture */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        
        <div className="relative z-20 p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16 shadow-xl border-2 border-white/20 bg-white/10 backdrop-blur-md rounded-2xl">
                {(agency?.logoUrl || agency?.logo_url) && (
                  <AvatarImage
                    src={agency.logoUrl || agency.logo_url || ''}
                    alt={agencyName}
                    className="object-contain p-1.5"
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white font-extrabold text-2xl rounded-2xl">
                  {agencyName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" title="Active Agency" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {agencyName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {agency?.subscriptionPlan ? `${agency.subscriptionPlan.toUpperCase()} TIER` : 'OPERATIONAL'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300/80">
                <span className="flex items-center gap-1 text-slate-200 font-medium">
                  <ShieldIcon className="w-3.5 h-3.5 text-indigo-400" /> Agency Workspace
                </span>
                {agency?.domain && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-400">{agency.domain}</span>
                  </>
                )}
                {agency?.maxUsers && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{totalUsers} / {agency.maxUsers} Seats Used</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/project-management')}
              className="flex items-center gap-1.5 bg-white text-slate-950 hover:bg-slate-100 font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              New Project
            </button>
            <button
              onClick={() => navigate('/department-management')}
              className="flex items-center gap-1.5 bg-slate-800/90 text-white hover:bg-slate-700/90 font-medium px-3.5 py-2 rounded-xl text-xs border border-white/10 shadow-sm transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Manage Team
            </button>

            <div className="flex items-center gap-1 pl-1 border-l border-white/10">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing || loading}
                title="Refresh Metrics"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCcw className={cn("w-3.5 h-3.5", (isRefreshing || loading) && "animate-spin text-indigo-400")} />
              </button>
              <button
                onClick={() => navigate('/settings')}
                title="Agency Settings"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/crm')}
                title="Client CRM"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </FloatingCard>

      {/* =====================================================================
          MAIN DASHBOARD GRID
          ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Section: Live Metrics & Activity Feed (Col 8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Top 4 KPI Cards */}
          <FloatingCard delay={0.15} className="bg-white/80 dark:bg-[#1a1d24]/90 p-6 md:p-7">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100/80 dark:border-gray-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Live Operational Metrics
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Real-time statistics connected directly to your agency database</p>
              </div>
              <button 
                onClick={() => navigate('/settings')} 
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                Configure <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <div 
                onClick={() => navigate('/employees')}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-sm cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <MicroLabel className="mb-1 text-slate-400">Total Team</MicroLabel>
                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{totalUsers}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {metrics?.activeUsers || totalUsers} active members
                </div>
              </div>

              {/* Total Projects */}
              <div 
                onClick={() => navigate('/project-management')}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 hover:border-purple-200 dark:hover:border-purple-900/50 hover:shadow-sm cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </div>
                <MicroLabel className="mb-1 text-slate-400">Projects</MicroLabel>
                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{totalProjects}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {activeProjects} in progress
                </div>
              </div>

              {/* Monthly Revenue */}
              <div 
                onClick={() => navigate('/finance')}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:shadow-sm cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <MicroLabel className="mb-1 text-slate-400">Monthly Revenue</MicroLabel>
                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  ₹{(metrics?.monthlyRevenue || metrics?.totalRevenue || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  Active billing ledger
                </div>
              </div>

              {/* Leave Requests & Attendance */}
              <div 
                onClick={() => navigate('/attendance')}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 hover:border-amber-200 dark:hover:border-amber-900/50 hover:shadow-sm cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
                <MicroLabel className="mb-1 text-slate-400">Leave Requests</MicroLabel>
                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {metrics?.leaveRequests?.pending || 0}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {metrics?.leaveRequests?.approved || 0} approved leaves
                </div>
              </div>
            </div>
          </FloatingCard>

          {/* Sub-grid for Recent Activity and Key Priorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Live Activity Feed */}
            <FloatingCard delay={0.2} className="bg-white/80 dark:bg-[#1a1d24]/90 p-5 md:p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Recent Activity
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Live workspace audit trail</p>
                  </div>
                  <button 
                    onClick={() => navigate('/audit-logs')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>

                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((act) => {
                      const isProject = act.type === 'project';
                      return (
                        <div 
                          key={act.id} 
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-800/80 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                              isProject 
                                ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                                : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                            )}>
                              {isProject ? <Briefcase className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                {act.title}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {act.description}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 pl-2">
                            <span className="text-[10px] font-mono text-gray-400 block mb-0.5">
                              {formatRelativeTime(act.timestamp)}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {act.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800">
                    <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No activity logged yet</p>
                    <p className="text-[11px] text-slate-400 max-w-[220px] mt-1">
                      Start creating projects and adding team members to populate the live log.
                    </p>
                    <button
                      onClick={() => navigate('/project-management')}
                      className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      + Create first project
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100/80 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Synced with database
                </span>
                <button 
                  onClick={handleManualRefresh}
                  className="hover:text-gray-900 dark:hover:text-gray-200 font-medium"
                >
                  Refresh now
                </button>
              </div>
            </FloatingCard>

            {/* Key Priorities / Persistent Checklist */}
            <FloatingCard delay={0.25} className="bg-white/80 dark:bg-[#1a1d24]/90 p-5 md:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Key Priorities
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {completedPrioritiesCount} of {priorities.length} completed
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Add Task Input Form */}
              <AnimatePresence>
                {showAddTask && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={addTask}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        placeholder="New priority task..."
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                      >
                        Save
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Checklist Items */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-1">
                {priorities.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between gap-3 group p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div 
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0",
                        task.done 
                          ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-xs" 
                          : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                      )}>
                        {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={cn(
                        "text-xs font-medium transition-all select-none truncate",
                        task.done 
                          ? "text-slate-400 dark:text-slate-500 line-through" 
                          : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
                      )}>
                        {task.label}
                      </span>
                    </div>

                    <button 
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Progress Bar & Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100/80 dark:border-gray-800/80 space-y-2">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Checklist Progress</span>
                  <span>{Math.round((completedPrioritiesCount / (priorities.length || 1)) * 100)}%</span>
                </div>
                <Progress 
                  value={(completedPrioritiesCount / (priorities.length || 1)) * 100} 
                  className="h-1.5 bg-slate-100 dark:bg-slate-800" 
                />
              </div>
            </FloatingCard>

          </div>
        </div>

        {/* Right Section: Workspace Capacity & System Diagnostics (Col 4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <FloatingCard delay={0.3} className="flex-1 flex flex-col justify-between bg-white/80 dark:bg-[#1a1d24]/90 p-6">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Workspace Health
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Capacity & operational status</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  HEALTHY
                </span>
              </div>
              
              {/* Radial Operational Gauge */}
              <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 absolute inset-0 drop-shadow-sm" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="10" />
                  {/* Dynamic Progress Fill */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    className="stroke-indigo-600 dark:stroke-indigo-400 fill-none transition-all duration-1000 ease-out" 
                    strokeWidth="10" 
                    strokeDasharray={`${(systemHealthScore / 100) * 238} 238`} 
                    strokeLinecap="round" 
                  />
                </svg>
                
                <div className="flex flex-col items-center justify-center z-10 bg-white dark:bg-slate-900 rounded-full w-32 h-32 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-none">
                    {systemHealthScore}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    Index Score
                  </span>
                </div>
              </div>

              {/* Module Operational Status Matrix */}
              <div className="space-y-2.5 mt-6 pt-5 border-t border-gray-100/80 dark:border-gray-800/80">
                <MicroLabel className="mb-2">Module Diagnostics</MicroLabel>
                
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/40">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Team & Directory
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    {totalUsers} Members Active
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/40">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-purple-500" /> Project Pipeline
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    {activeProjects} Active
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/40">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Leave Management
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                    {metrics?.leaveRequests?.pending || 0} Pending Approvals
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/40">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ShieldIcon className="w-3.5 h-3.5 text-indigo-500" /> Security & Role Access
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    RBAC Enforced
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100/80 dark:border-gray-800/80">
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                Workspace Business Settings
              </button>
            </div>
          </FloatingCard>
        </div>

      </div>
    </div>
  );
};

export default AgencyAdminDashboard;
