import { motion } from 'framer-motion';
import {
    Users,
    MessageSquare,
    Phone,
    Video,
    Mail,
    MoreVertical,
    Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const TeamView = () => {
    const members = [
        { name: 'Sarah Wilson', role: 'Creative Director', status: 'Active', avatar: 'SW', color: 'bg-indigo-500' },
        { name: 'Burhan', role: 'Product Lead', status: 'In Meeting', avatar: 'BA', color: 'bg-primary' },
        { name: 'Anna Chen', role: 'UI/UX Designer', status: 'Online', avatar: 'AC', color: 'bg-purple-500' },
        { name: 'David Miller', role: 'Full Stack Dev', status: 'Offline', avatar: 'DM', color: 'bg-orange-500' },
        { name: 'Elena Rodriguez', role: 'Project Manager', status: 'Online', avatar: 'ER', color: 'bg-emerald-500' },
    ];

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Elite Tribe</h3>
                    <p className="text-xs text-muted-foreground mt-1">Real-time presence and resource allocation.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs font-bold hover:bg-muted/80 transition-all">
                        <Video className="w-3.5 h-3.5" />
                        Scrum Call
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {members.map((member, i) => (
                    <motion.div
                        key={member.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group cursor-pointer flex items-center gap-4"
                    >
                        <div className="relative">
                            <div className={`w-12 h-12 rounded-2xl ${member.color} flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-110 transition-transform`}>
                                {member.avatar}
                            </div>
                            <div className={cn(
                                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-card",
                                member.status === 'Online' || member.status === 'Active' ? 'bg-success' :
                                    member.status === 'In Meeting' ? 'bg-error' : 'bg-muted-foreground'
                            )} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{member.name}</h4>
                                {member.status === 'Active' && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-black uppercase ring-1 ring-primary/20">Lead</span>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium">{member.role}</p>
                        </div>

                        <div className="hidden sm:flex items-center gap-1.5">
                            <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
                                <MessageSquare className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
                                <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Team Availability</span>
                    <span className="text-[10px] font-bold text-foreground">84% Capacity</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '84%' }}
                        className="h-full bg-primary"
                    />
                </div>
            </div>
        </div>
    );
};
