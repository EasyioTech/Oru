import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, lazy, Suspense } from 'react';
import {
  Play,
  ChevronRight,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Menu,
  DollarSign,
  UserCheck,
  Target,
  FileDown,
  MessageSquare,
  HardDrive,
  BarChart3,
  Loader2
} from 'lucide-react';
import { SectionTitle } from '../fragments';

// Lazy load views
const DashboardView = lazy(() => import('./showcase-views/DashboardView').then(m => ({ default: m.DashboardView })));
const ProjectsView = lazy(() => import('./showcase-views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const TeamView = lazy(() => import('./showcase-views/TeamView').then(m => ({ default: m.TeamView })));
const SettingsView = lazy(() => import('./showcase-views/SettingsView').then(m => ({ default: m.SettingsView })));
const PayrollView = lazy(() => import('./showcase-views/PayrollView').then(m => ({ default: m.PayrollView })));
const HRMSView = lazy(() => import('./showcase-views/HRMSView').then(m => ({ default: m.HRMSView })));
const CRMView = lazy(() => import('./showcase-views/CRMView').then(m => ({ default: m.CRMView })));
const InvoicingView = lazy(() => import('./showcase-views/InvoicingView').then(m => ({ default: m.InvoicingView })));
const ChatView = lazy(() => import('./showcase-views/ChatView').then(m => ({ default: m.ChatView })));
const FileManagementView = lazy(() => import('./showcase-views/FileManagementView').then(m => ({ default: m.FileManagementView })));
const FinancialManagementView = lazy(() => import('./showcase-views/FinancialManagementView').then(m => ({ default: m.FinancialManagementView })));

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'hrms', label: 'HRMS', icon: UserCheck },
  { id: 'crm', label: 'CRM Leads', icon: Target },
  { id: 'invoicing', label: 'Invoices', icon: FileDown },
  { id: 'chat', label: 'Live Chat', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: HardDrive },
  { id: 'financials', label: 'Financials', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const views: Record<string, React.FC> = {
  dashboard: DashboardView,
  projects: ProjectsView,
  team: TeamView,
  payroll: PayrollView,
  hrms: HRMSView,
  crm: CRMView,
  invoicing: InvoicingView,
  chat: ChatView,
  files: FileManagementView,
  financials: FinancialManagementView,
  settings: SettingsView,
};

const LoadingState = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950/20 backdrop-blur-[2px]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="w-8 h-8 text-blue-500/50" />
    </motion.div>
    <p className="text-[10px] text-zinc-500 mt-3 font-medium uppercase tracking-widest">Loading Module...</p>
  </div>
);

export const ProductShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveView = views[activeTab];

  return (
    <section ref={ref} className="relative py-16 sm:py-24 lg:py-32 px-4 overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SectionTitle
          badge="Product Ecosystem"
          title="One platform, every operation"
          description="Everything your agency needs to scale. Powerful modules designed to work together seamlessly."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 sm:mt-16"
        >
          <div className="relative rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
            <div className="absolute -inset-px bg-gradient-to-b from-white/[0.12] to-transparent rounded-2xl sm:rounded-3xl pointer-events-none" />

            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-zinc-900/60">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-xl hover:bg-white/[0.05] transition-colors active:scale-95"
                >
                  <Menu className="w-5 h-5 text-zinc-400" />
                </button>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60 border border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.2)]" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60 border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.2)]" />
                </div>
              </div>
              <div className="hidden md:block px-6 py-1.5 rounded-full bg-zinc-800/80 border border-white/[0.03] text-[10px] text-zinc-400 font-mono tracking-wide">
                app.oru.io<span className="text-zinc-600">/</span><span className="text-blue-400">{activeTab}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Live Operations</span>
              </div>
            </div>

            <div className="flex relative items-stretch h-[450px] sm:h-[520px] lg:h-[600px]">
              <div className={`
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                absolute md:relative z-20
                w-56 sm:w-64 h-full
                border-r border-white/[0.06] bg-zinc-900/98 md:bg-zinc-900/40 
                flex flex-col
                transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
              `}>
                <div className="p-4 sm:p-6 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                      <span className="text-sm font-black text-white italic">O</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-display tracking-tight">Oru Enterprise</div>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Admin Dashboard</div>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6 space-y-1">
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-3 mb-2 mt-4 ml-0.5">Core Modules</div>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 relative group overflow-hidden ${activeTab === tab.id
                          ? 'bg-blue-500/10 text-white'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                        }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-blue-500/10 border-l-2 border-blue-500"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? 'text-blue-400' : 'group-hover:text-zinc-300 transition-colors'}`} />
                      <span className="text-xs font-medium relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
              </AnimatePresence>

              <div className="flex-1 min-w-0 bg-zinc-900/20 relative">
                <div className="absolute inset-0 pointer-events-none border-l border-white/[0.02]" />
                <Suspense fallback={<LoadingState />}>
                  <ActiveView />
                </Suspense>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6"
          >
            <button className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-xs sm:text-sm text-zinc-300 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15] transition-all active:scale-95">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform">
                <Play className="w-2.5 h-2.5 text-white fill-current ml-0.5" />
              </div>
              Watch Product Walkthrough
            </button>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    JD
                  </div>
                ))}
              </div>
              <span className="text-xs text-zinc-500">Used by <span className="text-zinc-300 font-bold">500+</span> agencies</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </section>
  );
};
