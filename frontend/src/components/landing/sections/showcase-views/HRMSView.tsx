import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Calendar,
    Clock,
    Plus,
    MoreHorizontal,
    ChevronRight,
    UserCheck,
    UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const HRMSView = () => {
    const departments = [
        { name: 'Engineering', count: 42, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { name: 'Design', count: 18, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { name: 'Marketing', count: 24, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { name: 'Operations', count: 12, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Human Resources</h3>
                    <p className="text-xs text-muted-foreground mt-1">Manage talent, attendance, and organizational growth.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs font-bold hover:bg-muted/80 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Leaves
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <UserPlus className="w-3.5 h-3.5" />
                        Hire Talent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {departments.map((dept, i) => (
                    <motion.div
                        key={dept.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group"
                    >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors", dept.bg)}>
                            <Users className={cn("w-5 h-5", dept.color)} />
                        </div>
                        <div className="text-lg font-bold text-foreground">{dept.count}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{dept.name}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-success" />
                            Attendance Today
                        </h4>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 rounded-md bg-muted border border-border">84/96 Present</span>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: 'Burhan', time: '09:12 AM', status: 'On Time', avatar: 'BA' },
                            { name: 'Sarah Wilson', time: '09:45 AM', status: 'Late', avatar: 'SW' },
                            { name: 'Anna Chen', time: '10:02 AM', status: 'Late', avatar: 'AC' },
                        ].map((person, i) => (
                            <div key={i} className="flex items-center mt-2 group first:mt-0">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {person.avatar}
                                </div>
                                <div className="flex-1 ml-3">
                                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{person.name}</div>
                                    <div className="text-[9px] text-muted-foreground font-medium">{person.time}</div>
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                                    person.status === 'On Time' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
                                )}>{person.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 relative">
                        <Building2 className="w-8 h-8" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full border-2 border-primary/20"
                        />
                    </div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Company Culture</h4>
                    <p className="text-[10px] text-muted-foreground px-4 mb-4">Engage your team with automated pulse surveys and feedback loops.</p>
                    <button className="text-[10px] font-bold text-primary hover:underline">Launch Pulse Survey</button>
                </div>
            </div>
        </div>
    );
};
