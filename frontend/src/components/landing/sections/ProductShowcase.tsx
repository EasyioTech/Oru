import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, lazy, Suspense } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Plus,
  Bell,
  Wallet,
  Building2,
  Users2,
  Receipt,
  MessageSquare,
  Files,
  TrendingUp,
  LineChart,
  Menu,
  X
} from 'lucide-react';
import { SectionTitle, Container } from '../fragments';
import { cn } from '@/lib/utils';

// Lazy load views for better performance
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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-indigo-500' },
  { id: 'team', label: 'Team', icon: Users, color: 'text-emerald-500' },
  { id: 'payroll', label: 'Payroll', icon: Wallet, color: 'text-amber-500' },
  { id: 'hrms', label: 'HRMS', icon: Building2, color: 'text-purple-500' },
  { id: 'crm', label: 'CRM', icon: Users2, color: 'text-pink-500' },
  { id: 'invoicing', label: 'Invoicing', icon: Receipt, color: 'text-cyan-500' },
  { id: 'chat', label: 'Internal Chat', icon: MessageSquare, color: 'text-blue-400' },
  { id: 'files', label: 'File Manager', icon: Files, color: 'text-orange-500' },
  { id: 'financials', label: 'Financials', icon: LineChart, color: 'text-emerald-400' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-zinc-400' },
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
  <div className="w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-sm font-medium text-muted-foreground">Syncing Oru...</span>
    </div>
  </div>
);

export const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const ActiveView = views[activeTab];

  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden border-t border-border">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-muted-foreground/5 rounded-full blur-[120px] pointer-events-none opacity-20" />

      <Container className="relative z-10">
        <SectionTitle
          badge="Product Tour"
          title="See Oru in Action"
          description="A centralized operating system for modern agencies. Everything connected, nothing lost in translation."
        />

        {/* Browser Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          viewport={{ once: true }}
          className="mt-16 md:mt-24 relative mx-auto max-w-[1100px]"
        >
          <div className={cn(
            "relative bg-card rounded-2xl border border-border shadow-2xl shadow-black/20 overflow-hidden transition-all duration-700",
            device === 'desktop' ? 'w-full aspect-[16/10]' :
              device === 'tablet' ? 'max-w-[768px] aspect-[4/3] mx-auto' :
                'max-w-[375px] aspect-[9/19] mx-auto'
          )}>
            {/* Browser Header */}
            <div className="h-12 bg-muted/50 border-b border-border flex items-center px-4 gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error/20" />
                <div className="w-3 h-3 rounded-full bg-warning/20" />
                <div className="w-3 h-3 rounded-full bg-success/20" />
              </div>
              <div className="flex-1 bg-background/50 border border-border rounded-md px-3 py-1 flex items-center gap-2">
                <Search className="w-3 h-3 text-muted-foreground" />
                <div className="text-[10px] text-muted-foreground">oru.agency/dashboard</div>
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              </div>
            </div>

            <div className="flex h-[calc(100%-3rem)] overflow-hidden">
              {/* Internal Sidebar */}
              <div className={cn(
                "w-56 bg-muted/30 border-r border-border flex flex-col transition-all duration-300",
                "md:relative absolute md:translate-x-0 inset-y-0 z-20",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}>
                <div className="p-4 flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">O</div>
                  <span className="font-bold text-foreground tracking-tight">Oru ERP</span>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none custom-scrollbar px-2 space-y-0.5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <tab.icon className={cn(
                        "w-4 h-4",
                        activeTab === tab.id ? tab.color : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="truncate">{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="active-tab-indicator"
                          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-4 mt-auto border-t border-border">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">JD</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-foreground truncate">John Doe</div>
                      <div className="text-[8px] text-muted-foreground truncate">Agency Admin</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Container */}
              <div className="flex-1 relative flex flex-col min-w-0 bg-background/30 overflow-hidden">
                {/* Internal Toolbar */}
                <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="md:hidden p-2 rounded-lg hover:bg-muted"
                    >
                      {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <h2 className="text-sm font-bold text-foreground capitalize flex items-center gap-2">
                      {activeTab}
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="md:flex hidden items-center bg-muted/50 rounded-lg px-2 py-1 border border-border">
                      <Search className="w-3 h-3 text-muted-foreground" />
                      <input className="bg-transparent border-none text-[10px] outline-none ml-2 w-24" placeholder="Search..." />
                    </div>
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="h-full"
                    >
                      <Suspense fallback={<LoadingState />}>
                        <ActiveView />
                      </Suspense>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setDevice('desktop')}
              className={cn(
                "p-2.5 rounded-xl border-2 transition-all",
                device === 'desktop' ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={cn(
                "p-2.5 rounded-xl border-2 transition-all",
                device === 'tablet' ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={cn(
                "p-2.5 rounded-xl border-2 transition-all",
                device === 'mobile' ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </Container>

      {/* Internal Scroll Style */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}} />
    </section>
  );
};
