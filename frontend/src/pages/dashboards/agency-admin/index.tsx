import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAgencyAnalytics } from '@/hooks/useAgencyAnalytics';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Star, Plus, Share2, Upload, Settings, Monitor,
  Phone, Linkedin, Check, ChevronDown, Pen,
  MessageSquare, Briefcase, Users, Calendar, Activity,
  FileText, Mail, MoreHorizontal, Shield as ShieldIcon,
  RefreshCcw, BarChart3, DownloadCloud
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { DashboardHeaderBar } from '../../../modules/core/components';

// ----------------------------------------------------------------------
// DESIGN TOKENS & COMPONENTS (Design System First)
// ----------------------------------------------------------------------

import { FloatingCard, PillButton, NavIconButton, DisplayTitle, MicroLabel } from '@/components/ui/design-tokens';

// ----------------------------------------------------------------------
// DASHBOARD COMPOSITION
// ----------------------------------------------------------------------

const AgencyAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, profile } = useAuth();
  const { agency, metrics, loading, error, refreshMetrics } = useAgencyAnalytics();
  
  if (userRole === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  const agencyName = agency?.name || (profile as any)?.agency_name || 'Your Agency';
  const userName = (profile as any)?.first_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="w-full flex-1 space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* Hero Window with Background Image */}
      <FloatingCard delay={0.1} className="relative overflow-hidden p-0 border-0 shadow-lg mb-2 rounded-[2rem]">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop')" }} 
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" />
        
        <div className="relative z-20 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 shadow-md border-2 border-white/20">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl">
                {agencyName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md mb-0.5">
                {agencyName}
              </h1>
              <span className="text-xs md:text-sm text-white/70 font-medium tracking-wide uppercase drop-shadow flex items-center gap-1.5">
                <ShieldIcon className="w-3.5 h-3.5" /> Agency Administrator Dashboard
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <PillButton label="Generate Report" className="bg-white text-black hover:bg-gray-100 shadow-sm px-5 py-2 text-sm" />
            <div className="flex gap-1 ml-1">
              <button onClick={() => window.location.reload()} title="Refresh Data" className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/analytics')} title="Analytics" className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <BarChart3 className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/calendar')} title="Calendar" className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <Calendar className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/reports')} title="Download Reports" className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <DownloadCloud className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </FloatingCard>



      {/* Grid Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Sub-Grid (Metrics & Info) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <FloatingCard delay={0.3} className="bg-white/80 dark:bg-[#1a1d24]/90">
            <div className="flex justify-between items-start mb-8 border-b border-gray-100/60 dark:border-gray-800/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Agency Metrics</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Real-time overview of your agency's performance</p>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm transition-colors"><Pen className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
              <div className="flex gap-5 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <MicroLabel className="mb-0.5">Total Users</MicroLabel>
                  <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{metrics?.totalUsers || 0}</div>
                  <div className="text-xs font-medium text-gray-500 mt-1">{metrics?.activeUsers || 0} Active right now</div>
                </div>
              </div>
              
              <div className="flex gap-5 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <MicroLabel className="mb-0.5">Total Projects</MicroLabel>
                  <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{metrics?.totalProjects || 0}</div>
                  <div className="text-xs font-medium text-gray-500 mt-1">{metrics?.activeProjects || 0} Active projects</div>
                </div>
              </div>
              
              <div className="flex gap-5 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <MicroLabel className="mb-0.5">Monthly Revenue</MicroLabel>
                  <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">₹{metrics?.monthlyRevenue?.toLocaleString('en-IN') || 0}</div>
                  <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">+12% vs last month</div>
                </div>
              </div>
              
              <div className="flex gap-5 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <MicroLabel className="mb-0.5">Total Invoices</MicroLabel>
                  <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{metrics?.totalInvoices || 0}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </FloatingCard>

          {/* Sub-grid for Recent Activity and Priorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingCard delay={0.4} className="pb-4 bg-white/70 dark:bg-[#1a1d24]/90">
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Recent Activity</span>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><ChevronDown className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-5">
                {[
                  { title: 'Project Zenith', desc: 'Phase 2 Started', date: '04/18/2026', status: 'Active', icon: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
                  { title: 'Stark Invoice', desc: 'Payment Received', date: '04/18/2026', status: 'Completed', icon: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
                  { title: 'New Employee', desc: 'Onboarding', date: '04/17/2026', status: 'In Progress', icon: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
                ].map((act, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                    <div className="flex gap-4 items-center">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", act.icon)}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{act.desc}</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{act.title}</div>
                      </div>
                    </div>
                    <div className="text-right pr-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">{act.date}</div>
                      <div className="text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-block">{act.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FloatingCard>

            <FloatingCard delay={0.5} className="bg-white/70 dark:bg-[#1a1d24]/90 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Key Priorities</span>
                <PillButton label="View All" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 py-1.5 px-3 text-[10px]" />
              </div>
              <div className="space-y-4 flex-1">
                {[
                  { label: 'Review Q3 Budget', done: true },
                  { label: 'Client Onboarding', done: true },
                  { label: 'Finalize Hiring Plan', done: false },
                  { label: 'Update Security Policy', done: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors", task.done ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black" : "border-gray-300 dark:border-gray-600 text-transparent group-hover:border-gray-400 dark:group-hover:border-gray-500")}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={cn("text-sm font-medium transition-colors", task.done ? "text-gray-900 dark:text-gray-400 line-through decoration-2 decoration-gray-300 dark:decoration-gray-600" : "text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white")}>{task.label}</span>
                    <div className="flex-1 border-b border-dashed border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-colors" />
                    <button className="w-7 h-7 rounded-full border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:text-black dark:hover:text-white"><Pen className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-gray-100/60">
                <PillButton label="Mark Selected as Complete" className="w-full justify-center bg-black text-white py-3.5 rounded-xl shadow-md hover:bg-gray-900 text-sm font-bold" />
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Right Sub-Grid (AI Score & Insights) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <FloatingCard delay={0.6} className="flex-1 flex flex-col items-center relative overflow-hidden bg-gradient-to-b from-white/90 to-white/50 dark:from-[#1a1d24]/90 dark:to-[#1a1d24]/50">
            <div className="w-full flex justify-between items-start mb-2">
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Agency Health</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Overall system index score</p>
              </div>
              <button className="w-9 h-9 rounded-full border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm transition-colors"><Monitor className="w-4 h-4" /></button>
            </div>
            
            {/* THICKENED Radial Chart implementation */}
            <div className="relative w-56 h-56 my-8 flex items-center justify-center">
              {/* Background rings with thicker strokes */}
              <svg className="w-full h-full -rotate-90 absolute inset-0 drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" className="stroke-gray-100/80 fill-none" strokeWidth="12" />
                <circle cx="50" cy="50" r="38" className="stroke-green-400 fill-none transition-all duration-1000 ease-in-out" strokeWidth="12" strokeDasharray="160 250" strokeLinecap="round" />
                <circle cx="50" cy="50" r="38" className="stroke-blue-400 fill-none transition-all duration-1000 ease-in-out delay-300" strokeWidth="12" strokeDasharray="60 250" strokeDashoffset="-160" strokeLinecap="round" />
                <circle cx="50" cy="50" r="38" className="stroke-red-400 fill-none transition-all duration-1000 ease-in-out delay-500" strokeWidth="12" strokeDasharray="20 250" strokeDashoffset="-220" strokeLinecap="round" />
              </svg>
              
              <div className="flex flex-col items-center z-10 bg-white dark:bg-gray-900 rounded-full w-40 h-40 shadow-inner flex items-center justify-center border border-gray-50 dark:border-gray-800">
                <span className="text-6xl font-bold tracking-tighter text-gray-900 dark:text-gray-100 leading-none mb-1 drop-shadow-sm">92</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Health Score</span>
              </div>
            </div>

            <div className="w-full pt-6 border-t border-gray-100/60 dark:border-gray-800/60 mt-2">
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2 tracking-wide uppercase">Top Insights <Star className="w-4 h-4 text-yellow-400 fill-current drop-shadow-sm" /></span>
              <div className="space-y-5">
                <div className="flex gap-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                  <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <MicroLabel className="text-blue-600/80 dark:text-blue-400 font-bold mb-0.5">User Growth</MicroLabel>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">+15% increase this quarter</div>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100/50 dark:border-green-900/30">
                  <Briefcase className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <MicroLabel className="text-green-600/80 dark:text-green-400 font-bold mb-0.5">Project Completion</MicroLabel>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">98% delivery rate on time</div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <PillButton label="View Detailed Report" className="w-full justify-center bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl shadow-md hover:bg-gray-900 dark:hover:bg-gray-100 font-bold text-sm transition-all hover:-translate-y-0.5" />
              </div>
            </div>
          </FloatingCard>
        </div>

      </div>
    </div>
  );
};

// Helper Icon
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}

export default AgencyAdminDashboard;

