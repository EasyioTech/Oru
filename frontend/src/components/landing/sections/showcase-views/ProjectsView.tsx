import { motion } from 'framer-motion';
import {
    FolderKanban,
    Search,
    Filter,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus
} from 'lucide-react';

export const ProjectsView = () => {
    const projects = [
        { title: 'E-commerce Redesign', client: 'StyleHub', status: 'In Progress', progress: 65, color: 'bg-indigo-500' },
        { title: 'Brand Identity', client: 'Nexus AI', status: 'Review', progress: 90, color: 'bg-blue-500' },
        { title: 'Mobile App Dev', client: 'FitTrack', status: 'In Progress', progress: 40, color: 'bg-emerald-500' },
        { title: 'SEO Optimization', client: 'EcoWare', status: 'Completed', progress: 100, color: 'bg-purple-500' },
    ];

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Active Projects</h3>
                    <p className="text-xs text-muted-foreground mt-1">Manage and track your agency's delivery velocity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            placeholder="Search projects..."
                            className="pl-9 pr-4 py-2 bg-muted rounded-xl border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-48 transition-all"
                        />
                    </div>
                    <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Plus className="w-3.5 h-3.5" />
                        New Project
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, i) => (
                    <motion.div
                        key={project.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-3">
                                <div className={`w-10 h-10 rounded-xl ${project.color}/10 flex items-center justify-center`}>
                                    <FolderKanban className={`w-5 h-5 ${project.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{project.title}</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium">{project.client}</p>
                                </div>
                            </div>
                            <button className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                                    className={`h-full ${project.color} group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all`}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-foreground">{project.progress}%</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(m => (
                                    <div key={m} className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                        U{m}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted border border-border">
                                {project.status === 'Completed' ? (
                                    <CheckCircle2 className="w-3 h-3 text-success" />
                                ) : project.status === 'Review' ? (
                                    <AlertCircle className="w-3 h-3 text-warning" />
                                ) : (
                                    <Clock className="w-3 h-3 text-primary" />
                                )}
                                <span className="text-[9px] font-bold text-muted-foreground uppercase">{project.status}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">12 tasks completed</div>
                        <div className="text-[9px] text-muted-foreground font-medium">in the last 24 hours across all projects</div>
                    </div>
                </div>
                <button className="text-[10px] font-bold text-primary hover:underline">View Timeline</button>
            </div>
        </div>
    );
};
