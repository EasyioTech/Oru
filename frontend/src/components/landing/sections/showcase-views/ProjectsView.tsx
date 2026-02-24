import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';

export const ProjectsView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white font-display">Active Projects</h3>
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-blue-500/20 text-[10px] sm:text-xs text-blue-400 font-medium">+ New Project</div>
        </div>

        <div className="space-y-2 sm:space-y-3">
            {[
                { name: 'Brand Redesign', client: 'Acme Corp', progress: 75, status: 'On Track', color: 'emerald' },
                { name: 'Mobile App', client: 'TechStart', progress: 45, status: 'In Progress', color: 'blue' },
                { name: 'Website Launch', client: 'FinServ', progress: 90, status: 'Review', color: 'purple' },
                { name: 'Marketing Campaign', client: 'RetailCo', progress: 30, status: 'Starting', color: 'orange' },
            ].map((project, i) => (
                <motion.div
                    key={project.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04] hover:border-white/[0.08] transition-colors cursor-pointer group"
                >
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${project.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                            <FileText className={`w-4 h-4 sm:w-5 sm:h-5 text-${project.color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-medium text-white truncate">{project.name}</span>
                                <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-${project.color}-500/20 text-${project.color}-400 flex-shrink-0`}>
                                    {project.status}
                                </span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-zinc-500">{project.client}</span>
                        </div>
                        <div className="hidden sm:block w-24 lg:w-32">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-zinc-500">Progress</span>
                                <span className="text-xs text-zinc-400">{project.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full bg-${project.color}-500 rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                                />
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors hidden sm:block" />
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);
