import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  FolderKanban,
  Users,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Plus,
  Zap,
  Shield,
  Search,
  IndianRupee
} from 'lucide-react';
import { SectionTitle } from '../fragments';

const KanbanPreview = () => {
  const columns = [
    {
      name: 'To Do', color: 'bg-muted-foreground/30', tasks: [
        { title: 'Brand Design', tag: 'Visual', priority: 'high' },
        { title: 'Research', tag: 'UX', priority: 'medium' },
      ]
    },
    {
      name: 'Doing', color: 'bg-primary', tasks: [
        { title: 'API Integration', tag: 'Backend', priority: 'high' },
      ]
    },
    {
      name: 'Done', color: 'bg-success', tasks: [
        { title: 'IA Audit', tag: 'Strategy', priority: 'low' },
      ]
    },
  ];

  return (
    <div className="flex gap-2 h-full p-4 bg-muted/20">
      {columns.map((col, colIdx) => (
        <motion.div
          key={col.name}
          className="flex-1 flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: colIdx * 0.1, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{col.name}</span>
          </div>

          {col.tasks.map((task, taskIdx) => (
            <motion.div
              key={task.title}
              className="p-2.5 rounded-xl bg-card border border-border shadow-sm group hover:border-primary/30 transition-all cursor-pointer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: colIdx * 0.1 + taskIdx * 0.05 + 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-[10px] font-semibold text-foreground mb-2">{task.title}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{task.tag}</span>
                <div className={`w-1 h-1 rounded-full ml-auto ${task.priority === 'high' ? 'bg-error' :
                  task.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                  }`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

const FinancePreview = () => {
  const data = [35, 48, 42, 68, 55, 78, 82, 75, 92];
  const maxVal = Math.max(...data);

  return (
    <div className="h-full p-4 flex flex-col bg-muted/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-medium text-muted-foreground">Revenue Flow</div>
          <div className="text-xl font-bold text-foreground font-display tracking-tight">₹12.8L</div>
        </div>
        <div className="flex items-center gap-1 text-success bg-success/10 px-2.5 py-1 rounded-full ring-1 ring-success/20">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-bold">+28%</span>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-1.5">
        {data.map((val, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-lg"
            initial={{ height: 0 }}
            whileInView={{ height: `${(val / maxVal) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            viewport={{ once: true }}
          />
        ))}
      </div>
    </div>
  );
};

const TeamPreview = () => {
  const members = [
    { name: 'Sarah', role: 'Dev Lead', status: 'online', color: 'bg-blue-500' },
    { name: 'Burhan', role: 'Architect', status: 'online', color: 'bg-primary' },
    { name: 'Anna', role: 'Creative', status: 'away', color: 'bg-purple-500' },
  ];

  return (
    <div className="h-full p-4 bg-muted/20">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Tribe</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Sync
        </div>
      </div>

      <div className="space-y-2.5">
        {members.map((member, i) => (
          <motion.div
            key={member.name}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border shadow-sm hover:border-primary/20 transition-all cursor-pointer group"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-[11px] font-bold text-white shadow-inner`}>
                {member.name[0]}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${member.status === 'online' ? 'bg-success' : 'bg-warning'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{member.name}</div>
              <div className="text-[10px] text-muted-foreground font-medium">{member.role}</div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SalesPreview = () => {
  return (
    <div className="h-full p-4 flex flex-col bg-muted/20">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Growth Engine</span>
        <IndianRupee className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        {[
          { label: 'Leads Generated', value: '482', color: 'bg-primary' },
          { label: 'Conversions', value: '124', color: 'bg-success' },
        ].map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11px] font-bold text-foreground mb-2 px-1">
              <span>{item.label}</span>
              <span className="text-primary">{item.value}+</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '75%' }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                className={`h-full ${item.color} rounded-full shadow-lg shadow-primary/20`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const IntelligencePreview = () => {
  return (
    <div className="h-full p-4 flex flex-col items-center justify-center bg-muted/20 space-y-4">
      <div className="relative w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-8 h-8 text-primary fill-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
        </div>
      </div>
      <div className="text-center">
        <div className="text-[11px] font-bold text-foreground">AI Automations</div>
        <div className="text-[9px] text-muted-foreground mt-1">12 automated flows active</div>
      </div>
    </div>
  );
}

const features = [
  {
    id: 'projects',
    title: 'Precision Execution',
    description: 'Kanban, Gantt, and Sprints. Master every pixel of your projects with pixel-perfect control.',
    icon: FolderKanban,
    color: 'blue',
    preview: KanbanPreview,
    gridClass: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 'finance',
    title: 'Financial Sovereignty',
    description: 'Real-time billing, automatic recurring invoices, and crystal clear P&L visibility.',
    icon: IndianRupee,
    color: 'emerald',
    preview: FinancePreview,
    gridClass: 'md:col-span-1 md:row-span-2',
  },
  {
    id: 'team',
    title: 'Radical Collaboration',
    description: 'Sync your entire tribe. One source of truth for communication and resource planning.',
    icon: Users,
    color: 'purple',
    preview: TeamPreview,
    gridClass: 'md:col-span-1 md:row-span-2',
  },
  {
    id: 'sales',
    title: 'Velocity Sales',
    description: 'High-octane lead management and deal tracking that helps you close 3x faster.',
    icon: TrendingUp,
    color: 'orange',
    preview: SalesPreview,
    gridClass: 'md:col-span-1 md:row-span-2',
  },
  {
    id: 'ai',
    title: 'Auto-Pilot Mode',
    description: 'Leverage AI for routine tasks, reporting, and resource forecasting.',
    icon: Zap,
    color: 'cyan',
    preview: IntelligencePreview,
    gridClass: 'md:col-span-1 md:row-span-2',
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const Preview = feature.preview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5 hover:shadow-primary/5 transition-all duration-700 cursor-pointer p-8 ${feature.gridClass}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/5">
              <feature.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground font-display tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-[240px]">{feature.description}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="flex-1 min-h-[220px] rounded-[1.5rem] border border-border overflow-hidden ring-4 ring-secondary/30 group-hover:ring-primary/5 transition-all duration-700 shadow-inner">
          <Preview />
        </div>
      </div>
    </motion.div>
  );
};

export const BentoFeatures = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32 px-4 overflow-hidden bg-background">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1240px] mx-auto">
        <SectionTitle
          badge="Infrastructure"
          title="Your Agency, On Autopilot"
          description="Ditch the spreadsheet hell. Oru unifies your entire operation into a single source of truth, designed for the high-velocity agency."
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
