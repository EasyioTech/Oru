import { motion } from 'framer-motion';
import {
    Settings2,
    Shield,
    Bell,
    Users,
    Github,
    Link2,
    Database,
    Globe,
    Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SettingsView = () => {
    return (
        <div className="h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Workspace Configuration</h3>
                    <p className="text-xs text-muted-foreground mt-1">Manage global preferences and system integrations.</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-1">
                    {[
                        { label: 'General', icon: Settings2, active: true },
                        { label: 'Security', icon: Shield },
                        { label: 'Notifications', icon: Bell },
                        { label: 'Members', icon: Users },
                        { label: 'Billing', icon: Database },
                    ].map((item, i) => (
                        <div
                            key={item.label}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                item.active
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            Regional Settings
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Workspace Domain</label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border">
                                    <span className="text-xs text-foreground">Easyio.tech/oru</span>
                                    <Link2 className="w-3 h-3 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timezone</label>
                                <div className="px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground">
                                    IST (UTC+5:30)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-success" />
                            Connected Apps
                        </h4>
                        <div className="space-y-3">
                            {[
                                { name: 'Slack', status: 'Connected', icon: Hash, color: 'text-purple-500' },
                                { name: 'GitHub', status: 'Authorize', icon: Github, color: 'text-foreground' },
                            ].map((app, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg bg-card shadow-sm", app.color)}>
                                            <app.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">{app.name}</span>
                                    </div>
                                    <button className={cn(
                                        "text-[10px] font-bold px-3 py-1 rounded-lg transition-all",
                                        app.status === 'Connected' ? "bg-success/10 text-success" : "bg-primary text-primary-foreground"
                                    )}>
                                        {app.status}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Hash = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
);
